import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
} from "@headlessui/react";
import { categories } from "../../data/categories";
import { useLanguage } from "../../hooks/useLanguage";
import { Button } from "../UI/Button";
import { SpinnerIcon } from "../UI/Icon";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function uploadToCloudinary(file) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
        throw new Error("Cloudinary not configured");
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body,
        },
    );
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
}

function deleteFromCloudinary(cloudUrl) {
    const match = cloudUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) return;
    fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: match[1] }),
    }).catch(() => {});
}

function validate(data) {
    const e = {};
    if (!data.category) e.category = "categoryRequired";
    if (!data.businessName.trim()) e.businessName = "businessNameRequired";
    if (!data.descriptionEn.trim()) e.descriptionEn = "descriptionEnRequired";
    if (!data.descriptionUa.trim()) e.descriptionUa = "descriptionUaRequired";
    if (!data.phone.trim()) e.phone = "phoneRequired";
    else if (!/^[\d\s+\-()]+$/.test(data.phone.trim()))
        e.phone = "phoneInvalid";
    if (!data.email.trim()) e.email = "emailRequired";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        e.email = "emailInvalid";
    if (data.website && !/^https?:\/\//i.test(data.website))
        e.website = "websiteInvalid";
    if (data.instagram && !/instagram\.com\//i.test(data.instagram))
        e.instagram = "instagramInvalid";
    if (data.facebook && !/facebook\.com\//i.test(data.facebook))
        e.facebook = "facebookInvalid";
    if (data.linkedin && !/linkedin\.com\//i.test(data.linkedin))
        e.linkedin = "linkedinInvalid";
    if (!data.consent) e.consent = "consentRequired";
    return e;
}

function FormField({ label, hint, error, required, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-dark-blue">
                {label}
                {required && <span className="text-brand-red ml-1">*</span>}
            </label>
            {children}
            {error ? (
                <p className="text-xs text-brand-red">{error}</p>
            ) : hint ? (
                <p className="text-xs text-text/50">{hint}</p>
            ) : null}
        </div>
    );
}

const INITIAL = {
    category: "",
    businessName: "",
    descriptionEn: "",
    descriptionUa: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    consent: false,
    honeypot: "",
};

export function AddServiceForm() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [status, setStatus] = useState("idle");
    const [query, setQuery] = useState("");
    const [images, setImages] = useState([]);
    const optionsRef = useRef(null);
    const imagesRef = useRef(images);
    imagesRef.current = images;
    const wasSubmittedRef = useRef(false);
    const removedIdsRef = useRef(new Set());
    const pageUnloadingRef = useRef(false);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (wasSubmittedRef.current) return;
            pageUnloadingRef.current = true;
            imagesRef.current
                .filter((img) => img.cloudUrl)
                .forEach((img) => {
                    const match = img.cloudUrl.match(
                        /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/,
                    );
                    if (!match) return;
                    navigator.sendBeacon(
                        "/api/delete-image",
                        new Blob([JSON.stringify({ publicId: match[1] })], {
                            type: "application/json",
                        }),
                    );
                });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (wasSubmittedRef.current || pageUnloadingRef.current) return;
            imagesRef.current
                .filter((img) => img.cloudUrl)
                .forEach((img) => deleteFromCloudinary(img.cloudUrl));
        };
    }, []);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        e.target.value = "";
        const remaining = MAX_IMAGES - images.length;
        files.slice(0, remaining).forEach((file) => {
            if (file.size > MAX_FILE_SIZE) {
                alert(t("addService.errors.imageTooLarge"));
                return;
            }
            const id = Math.random().toString(36).slice(2);
            const previewUrl = URL.createObjectURL(file);
            setImages((prev) => [
                ...prev,
                { id, previewUrl, cloudUrl: null, status: "uploading" },
            ]);
            uploadToCloudinary(file)
                .then((cloudUrl) => {
                    if (removedIdsRef.current.has(id)) {
                        deleteFromCloudinary(cloudUrl);
                    } else {
                        setImages((prev) =>
                            prev.map((img) =>
                                img.id === id
                                    ? { ...img, cloudUrl, status: "done" }
                                    : img,
                            ),
                        );
                    }
                })
                .catch(() =>
                    setImages((prev) =>
                        prev.map((img) =>
                            img.id === id ? { ...img, status: "error" } : img,
                        ),
                    ),
                );
        });
    };

    const retryImage = (id) => {
        const img = images.find((i) => i.id === id);
        if (!img) return;
        setImages((prev) =>
            prev.map((i) => (i.id === id ? { ...i, status: "uploading" } : i)),
        );
        fetch(img.previewUrl)
            .then((r) => r.blob())
            .then((blob) => uploadToCloudinary(new File([blob], "image")))
            .then((cloudUrl) => {
                if (removedIdsRef.current.has(id)) {
                    deleteFromCloudinary(cloudUrl);
                } else {
                    setImages((prev) =>
                        prev.map((i) =>
                            i.id === id
                                ? { ...i, cloudUrl, status: "done" }
                                : i,
                        ),
                    );
                }
            })
            .catch(() =>
                setImages((prev) =>
                    prev.map((i) =>
                        i.id === id ? { ...i, status: "error" } : i,
                    ),
                ),
            );
    };

    const removeImage = (id) => {
        removedIdsRef.current.add(id);
        const img = images.find((i) => i.id === id);
        if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl);
        if (img?.cloudUrl) deleteFromCloudinary(img.cloudUrl);
        setImages((prev) => prev.filter((i) => i.id !== id));
    };

    const inputClass = (hasError) =>
        `w-full rounded-xl border ${hasError ? "border-brand-red" : "border-stroke"} bg-white dark:bg-[#0A1628] text-text px-4 py-3 text-base focus:outline-none focus:border-brand-blue placeholder:text-text/40 transition-colors`;

    const handleChange = (field, value) => {
        if (status === "error") setStatus("idle");
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const err = validate({ ...formData, [field]: value })[field];
            setErrors((prev) => ({ ...prev, [field]: err }));
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const err = validate(formData)[field];
        setErrors((prev) => ({ ...prev, [field]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const allErrors = validate(formData);
        setErrors(allErrors);
        setTouched(
            Object.fromEntries(Object.keys(INITIAL).map((k) => [k, true])),
        );
        if (Object.keys(allErrors).length > 0) return;

        setStatus("submitting");
        try {
            const res = await fetch("/api/submit-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    imageUrls: images
                        .filter((i) => i.status === "done")
                        .map((i) => i.cloudUrl),
                }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                wasSubmittedRef.current = true;
                setStatus("success");
                setFormData(INITIAL);
                setErrors({});
                setTouched({});
                setQuery("");
                setImages([]);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    const grouped = categories
        .map((cat) => ({
            name: cat.name,
            icon: cat.icon,
            subs: cat.subcategories.filter(
                (sub) =>
                    query === "" ||
                    sub.toLowerCase().includes(query.toLowerCase()) ||
                    t(`subcategories.${sub}`)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
            ),
        }))
        .filter((cat) => cat.subs.length > 0);

    if (status === "success") {
        return (
            <div className="text-center py-8 flex flex-col items-center gap-4">
                <p className="text-brand-blue text-lg font-bold">
                    {t("addService.success")}
                </p>
                <Link
                    to="/"
                    className="text-brand-blue hover:underline text-base"
                >
                    {t("addService.backHome")}
                </Link>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
        >
            {/* Honeypot */}
            <div
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                }}
                aria-hidden="true"
            >
                <input
                    type="text"
                    name="url_confirm"
                    value={formData.honeypot}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            honeypot: e.target.value,
                        }))
                    }
                    tabIndex={-1}
                    autoComplete="off"
                />
            </div>

            {/* Category */}
            <FormField
                label={t("addService.fields.category")}
                required
                error={
                    touched.category && errors.category
                        ? t(`addService.errors.${errors.category}`)
                        : undefined
                }
            >
                <div className="relative">
                    <Combobox
                        immediate
                        value={formData.category}
                        onChange={(val) => {
                            handleChange("category", val || "");
                            setQuery("");
                        }}
                    >
                        <ComboboxInput
                            className={inputClass(
                                touched.category && errors.category,
                            )}
                            onChange={(e) => setQuery(e.target.value)}
                            onBlur={() => handleBlur("category")}
                            onFocus={() =>
                                requestAnimationFrame(() => {
                                    if (optionsRef.current)
                                        optionsRef.current.scrollTop = 0;
                                })
                            }
                            displayValue={(val) =>
                                val ? t(`subcategories.${val}`) : ""
                            }
                            placeholder={t(
                                "addService.fields.categoryPlaceholder",
                            )}
                        />
                        <ComboboxOptions
                            ref={optionsRef}
                            className="absolute z-10 w-full mt-1 bg-white dark:bg-[#0F2040] border border-stroke rounded-2xl shadow-card overflow-y-auto max-h-64"
                        >
                            {grouped.length === 0 ? (
                                <div className="px-3 py-4 text-sm text-text/50">
                                    {t("addService.noResults")}
                                </div>
                            ) : (
                                grouped.map((cat) => (
                                    <div key={cat.name}>
                                        <div className="text-xs font-bold text-text/50 uppercase px-3 pt-3 pb-1 select-none">
                                            {cat.icon}{" "}
                                            {t(`categories.${cat.name}`)}
                                        </div>
                                        {cat.subs.map((sub) => (
                                            <ComboboxOption
                                                key={sub}
                                                value={sub}
                                                className="px-3 py-2 text-base text-text cursor-pointer data-[focus]:bg-light-gray data-[focus]:dark:bg-[#1E3A5F] data-[focus]:text-dark-blue"
                                            >
                                                {t(`subcategories.${sub}`)}
                                            </ComboboxOption>
                                        ))}
                                    </div>
                                ))
                            )}
                        </ComboboxOptions>
                    </Combobox>
                </div>
            </FormField>

            {/* Business name */}
            <FormField
                label={t("addService.fields.businessName")}
                required
                error={
                    touched.businessName && errors.businessName
                        ? t(`addService.errors.${errors.businessName}`)
                        : undefined
                }
            >
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                        handleChange("businessName", e.target.value)
                    }
                    onBlur={() => handleBlur("businessName")}
                    className={inputClass(
                        touched.businessName && errors.businessName,
                    )}
                    autoComplete="organization"
                />
            </FormField>

            {/* Description EN */}
            <FormField
                label={t("addService.fields.descriptionEn")}
                required
                error={
                    touched.descriptionEn && errors.descriptionEn
                        ? t(`addService.errors.${errors.descriptionEn}`)
                        : undefined
                }
            >
                <textarea
                    rows={4}
                    value={formData.descriptionEn}
                    onChange={(e) =>
                        handleChange("descriptionEn", e.target.value)
                    }
                    onBlur={() => handleBlur("descriptionEn")}
                    className={`${inputClass(touched.descriptionEn && errors.descriptionEn)} resize-none`}
                />
            </FormField>

            {/* Description UA */}
            <FormField
                label={t("addService.fields.descriptionUa")}
                required
                error={
                    touched.descriptionUa && errors.descriptionUa
                        ? t(`addService.errors.${errors.descriptionUa}`)
                        : undefined
                }
            >
                <textarea
                    rows={4}
                    value={formData.descriptionUa}
                    onChange={(e) =>
                        handleChange("descriptionUa", e.target.value)
                    }
                    onBlur={() => handleBlur("descriptionUa")}
                    className={`${inputClass(touched.descriptionUa && errors.descriptionUa)} resize-none`}
                />
            </FormField>

            {/* Phone */}
            <FormField
                label={t("addService.fields.phone")}
                required
                error={
                    touched.phone && errors.phone
                        ? t(`addService.errors.${errors.phone}`)
                        : undefined
                }
            >
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={inputClass(touched.phone && errors.phone)}
                    autoComplete="tel"
                />
            </FormField>

            {/* Email */}
            <FormField
                label={t("addService.fields.email")}
                required
                error={
                    touched.email && errors.email
                        ? t(`addService.errors.${errors.email}`)
                        : undefined
                }
            >
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={inputClass(touched.email && errors.email)}
                    autoComplete="email"
                />
            </FormField>

            {/* Optional section */}
            <div className="border-t border-stroke pt-6 flex flex-col gap-6">
                <p className="text-sm font-bold text-text/50 uppercase tracking-wide">
                    {t("addService.optionalSection")}
                </p>

                {/* Address */}
                <FormField
                    label={t("addService.fields.address")}
                    hint={t("addService.fields.addressHint")}
                >
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                            handleChange("address", e.target.value)
                        }
                        className={inputClass(false)}
                        autoComplete="street-address"
                    />
                </FormField>

                {/* Website */}
                <FormField
                    label={t("addService.fields.website")}
                    hint={t("addService.fields.websiteHint")}
                    error={
                        touched.website && errors.website
                            ? t(`addService.errors.${errors.website}`)
                            : undefined
                    }
                >
                    <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                            handleChange("website", e.target.value)
                        }
                        onBlur={() => handleBlur("website")}
                        className={inputClass(
                            touched.website && errors.website,
                        )}
                        autoComplete="url"
                    />
                </FormField>

                {/* Instagram */}
                <FormField
                    label={t("addService.fields.instagram")}
                    hint={t("addService.fields.instagramHint")}
                    error={
                        touched.instagram && errors.instagram
                            ? t(`addService.errors.${errors.instagram}`)
                            : undefined
                    }
                >
                    <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) =>
                            handleChange("instagram", e.target.value)
                        }
                        onBlur={() => handleBlur("instagram")}
                        className={inputClass(
                            touched.instagram && errors.instagram,
                        )}
                    />
                </FormField>

                {/* Facebook */}
                <FormField
                    label={t("addService.fields.facebook")}
                    hint={t("addService.fields.facebookHint")}
                    error={
                        touched.facebook && errors.facebook
                            ? t(`addService.errors.${errors.facebook}`)
                            : undefined
                    }
                >
                    <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) =>
                            handleChange("facebook", e.target.value)
                        }
                        onBlur={() => handleBlur("facebook")}
                        className={inputClass(
                            touched.facebook && errors.facebook,
                        )}
                    />
                </FormField>

                {/* LinkedIn */}
                <FormField
                    label={t("addService.fields.linkedin")}
                    hint={t("addService.fields.linkedinHint")}
                    error={
                        touched.linkedin && errors.linkedin
                            ? t(`addService.errors.${errors.linkedin}`)
                            : undefined
                    }
                >
                    <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) =>
                            handleChange("linkedin", e.target.value)
                        }
                        onBlur={() => handleBlur("linkedin")}
                        className={inputClass(
                            touched.linkedin && errors.linkedin,
                        )}
                    />
                </FormField>

                {/* Images */}
                <FormField
                    label={t("addService.fields.images")}
                    hint={t("addService.fields.imagesHint")}
                >
                    <div className="flex flex-col gap-3">
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative w-20 h-20"
                                    >
                                        <img
                                            src={img.previewUrl}
                                            alt=""
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        {img.status === "uploading" && (
                                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                                <SpinnerIcon className="w-5 h-5 text-white animate-spin" />
                                            </div>
                                        )}
                                        {img.status === "error" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    retryImage(img.id)
                                                }
                                                className="absolute inset-0 bg-brand-red/70 rounded-xl flex items-center justify-center text-white text-xs text-center px-1"
                                            >
                                                {t(
                                                    "addService.errors.imageUploadFailed",
                                                )}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(img.id)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white dark:bg-[#0F2040] rounded-full border border-stroke text-text flex items-center justify-center text-xs leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length < MAX_IMAGES && (
                            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline w-fit">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                + {t("addService.fields.imagesAdd")}
                            </label>
                        )}
                    </div>
                </FormField>
            </div>

            {/* Consent */}
            <div className="flex flex-col gap-1">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) =>
                            handleChange("consent", e.target.checked)
                        }
                        onBlur={() => handleBlur("consent")}
                        className="mt-0.5 w-4 h-4 accent-brand-red shrink-0"
                    />
                    <span className="text-sm text-text">
                        {t("addService.consent")}{" "}
                        <Link
                            to="/privacy"
                            className="text-brand-blue hover:underline"
                        >
                            {t("addService.consentLink")}
                        </Link>
                    </span>
                </label>
                {touched.consent && errors.consent && (
                    <p className="text-xs text-brand-red">
                        {t(`addService.errors.${errors.consent}`)}
                    </p>
                )}
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3">
                <Button
                    type="submit"
                    disabled={
                        status === "submitting" ||
                        images.some((i) => i.status === "uploading")
                    }
                    className="w-full md:w-auto md:self-start"
                >
                    {status === "submitting" ? (
                        <span className="flex items-center gap-2">
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            {t("addService.submitting")}
                        </span>
                    ) : (
                        t("addService.submit")
                    )}
                </Button>
                {status === "error" && (
                    <p className="text-sm text-brand-red">
                        {t("addService.error")}
                    </p>
                )}
            </div>
        </form>
    );
}
