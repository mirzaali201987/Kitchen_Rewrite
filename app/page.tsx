// source_handbook: week11-hackathon-preparation
"use client";

import { useState, useEffect } from "react";
import { ConstraintIconMap } from "./icons";

const CONSTRAINT_OPTIONS = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "nut_free", label: "Nut-free" },
  { value: "egg_free", label: "Egg-free" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "low_sodium", label: "Low sodium" },
  { value: "low_sugar", label: "Low sugar" },
];

const SAMPLE_RECIPE = `Classic Chocolate Chip Cookies

Ingredients:
- 2 1/4 cups wheat flour
- 1 cup butter, softened
- 3/4 cup white sugar
- 3/4 cup brown sugar
- 2 large eggs
- 1 tsp vanilla
- 1 tsp baking soda
- 1 tsp salt
- 2 cups chocolate chips
- 1 cup chopped walnuts

Steps:
1. Preheat oven to 375F.
2. Cream butter and sugars until fluffy.
3. Beat in eggs and vanilla.
4. Mix in flour, baking soda, and salt.
5. Stir in chocolate chips and walnuts.
6. Drop spoonfuls on baking sheet, bake 9-11 minutes.`;

type Change = {
  original_ingredient: string;
  replacement: string;
  swap_id: string;
  reason: string;
};

type Variant = {
  title: string;
  tradeoff_summary: string;
  ingredients: string[];
  steps: string[];
  changes: Change[];
};

type AdaptResult = {
  dish_description: string;
  image_keyword: string;
  cuisine_type: string;
  primary: Variant;
  alternate: Variant;
  warnings: string[];
  unmet_constraints: string[];
};

type ImageData = {
  url: string;
  alt: string;
  photographer_name: string;
  photographer_url: string;
};

export default function Page() {
  const [recipe, setRecipe] = useState(SAMPLE_RECIPE);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdaptResult | null>(null);
  const [error, setError] = useState("");
  const [activeVariant, setActiveVariant] = useState<"primary" | "alternate">("primary");
  const [image, setImage] = useState<ImageData | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // When a new result arrives, fetch a matching image
  useEffect(() => {
    if (!result?.image_keyword) {
      setImage(null);
      return;
    }
    let cancelled = false;
    setImageLoading(true);
    setImageFailed(false);
    setImage(null);

    const q = `${result.image_keyword} ${result.cuisine_type} food`.trim();

    fetch(`/api/image?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.url) {
          setImage(data);
        } else {
          setImageFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setImageFailed(true);
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false);
      });

    return () => { cancelled = true; };
  }, [result]);

  function toggleConstraint(value: string) {
    setConstraints((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  async function onAdapt() {
    setLoading(true);
    setError("");
    setResult(null);
    setImage(null);
    setImageFailed(false);
    setActiveVariant("primary");
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, constraints }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Request failed");
      else setResult(data);
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const currentVariant = result ? result[activeVariant] : null;

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 80px" }}>
      {/* Masthead */}
      <header style={{ marginBottom: 56, textAlign: "center" }} className="fade-up">
        <div style={{
          fontFamily: "Fraunces, serif",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--terracotta)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Vol. 1 · Issue 01
        </div>
        <h1 style={{ marginBottom: 14 }}>Kitchen Rewrite</h1>
        <p style={{
          fontFamily: "Fraunces, serif",
          fontStyle: "italic",
          fontSize: 18,
          color: "var(--ink-soft)",
          maxWidth: 540,
          margin: "0 auto",
          lineHeight: 1.5,
        }}>
          Any recipe, adapted to what you eat — grounded in a cook&apos;s knowledge of honest substitutions.
        </p>
        <div className="rule-ornament" style={{ maxWidth: 400, margin: "28px auto 0" }}>
          <span>❧</span>
        </div>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        alignItems: "start",
      }}>
        {/* LEFT COLUMN — input */}
        <section className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div style={{ marginBottom: 28 }}>
            <SectionLabel num="01" title="The recipe" />
            <textarea
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
              rows={16}
              placeholder="Paste any recipe here..."
              style={{
                width: "100%",
                padding: "18px 20px",
                fontSize: 14,
                fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                border: "1px solid var(--paper-edge)",
                borderRadius: 2,
                background: "#fff",
                color: "var(--ink)",
                lineHeight: 1.65,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--terracotta)"}
              onBlur={(e) => e.target.style.borderColor = "var(--paper-edge)"}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <SectionLabel num="02" title="Dietary constraints" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CONSTRAINT_OPTIONS.map((opt) => {
                const active = constraints.includes(opt.value);
                const Icon = ConstraintIconMap[opt.value];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleConstraint(opt.value)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 14px 9px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      border: active ? "1.5px solid var(--terracotta)" : "1px solid var(--paper-edge)",
                      background: active ? "var(--terracotta)" : "transparent",
                      color: active ? "#fff" : "var(--ink-soft)",
                      borderRadius: 999,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "var(--terracotta)";
                        e.currentTarget.style.color = "var(--terracotta)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = "var(--paper-edge)";
                        e.currentTarget.style.color = "var(--ink-soft)";
                      }
                    }}
                  >
                    {Icon && <Icon size={15} color={active ? "#fff" : "currentColor"} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onAdapt}
            disabled={loading || constraints.length === 0 || !recipe.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 32px",
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.02em",
              background: "var(--ink)",
              color: "var(--cream)",
              border: "none",
              borderRadius: 2,
              cursor: loading || constraints.length === 0 || !recipe.trim() ? "default" : "pointer",
              opacity: loading || constraints.length === 0 || !recipe.trim() ? 0.35 : 1,
              transition: "all 0.2s",
              fontFamily: "Fraunces, serif",
            }}
            onMouseEnter={(e) => {
              if (!loading && constraints.length > 0 && recipe.trim()) {
                e.currentTarget.style.background = "var(--terracotta-deep)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--ink)";
            }}
          >
            {loading ? (
              <>
                Rewriting
                <span><span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" /></span>
              </>
            ) : (
              <>
                Adapt this recipe
                <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
              </>
            )}
          </button>

          {error && (
            <div style={{
              marginTop: 20,
              padding: 14,
              background: "var(--rose-wash)",
              borderLeft: "3px solid var(--rose)",
              fontSize: 14,
              color: "var(--ink)",
            }}>
              {error}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN — output */}
        <section>
          {!result && !loading && (
            <EmptyState />
          )}

          {loading && <LoadingState />}

          {result && (
            <div className="fade-up">
              {/* Hero image with attribution */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  aspectRatio: "4/3",
                  width: "100%",
                  background: "var(--cream-deep)",
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: 2,
                }}>
                  {imageLoading ? (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, var(--cream-deep) 0%, var(--terracotta-wash) 100%)",
                    }}>
                      <div style={{
                        fontFamily: "Fraunces, serif",
                        fontStyle: "italic",
                        fontSize: 14,
                        color: "var(--ink-mute)",
                      }}>
                        finding a photo
                        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                      </div>
                    </div>
                  ) : image && !imageFailed ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      onError={() => setImageFailed(true)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <IllustrationFallback />
                  )}
                  {result.cuisine_type && (
                    <div style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "var(--cream)",
                      padding: "5px 12px",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--terracotta)",
                      fontWeight: 600,
                    }}>
                      {result.cuisine_type}
                    </div>
                  )}
                </div>
                {/* Attribution — required by Unsplash API guidelines */}
                {image && !imageFailed && (
                  <div style={{
                    fontSize: 10,
                    color: "var(--ink-mute)",
                    marginTop: 6,
                    textAlign: "right",
                    fontStyle: "italic",
                    fontFamily: "Fraunces, serif",
                  }}>
                    photo by{" "}
                    <a
                      href={image.photographer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--ink-mute)", textDecoration: "underline" }}
                    >
                      {image.photographer_name}
                    </a>
                    {" "}on{" "}
                    <a
                      href="https://unsplash.com/?utm_source=kitchen_rewrite&utm_medium=referral"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--ink-mute)", textDecoration: "underline" }}
                    >
                      unsplash
                    </a>
                  </div>
                )}
              </div>

              {/* Dish description */}
              {result.dish_description && (
                <p style={{
                  fontFamily: "Fraunces, serif",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "var(--ink-soft)",
                  lineHeight: 1.55,
                  marginBottom: 24,
                  marginTop: 0,
                }}>
                  {result.dish_description}
                </p>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div style={{
                  marginBottom: 24,
                  padding: 18,
                  background: "var(--mustard-wash)",
                  borderLeft: "3px solid var(--mustard)",
                }}>
                  <div style={{
                    fontFamily: "Fraunces, serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    marginBottom: 8,
                  }}>
                    Cook&apos;s notes
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>
                    {result.warnings.map((w, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unmet constraints */}
              {result.unmet_constraints.length > 0 && (
                <div style={{
                  marginBottom: 24,
                  padding: 14,
                  background: "var(--rose-wash)",
                  borderLeft: "3px solid var(--rose)",
                  fontSize: 13,
                }}>
                  <strong>Couldn&apos;t fully satisfy: </strong>
                  {result.unmet_constraints.join(", ")}
                </div>
              )}

              {/* Variant tabs */}
              <div style={{
                display: "flex",
                gap: 0,
                borderBottom: "1px solid var(--paper-edge)",
                marginBottom: 24,
              }}>
                <VariantTab
                  active={activeVariant === "primary"}
                  onClick={() => setActiveVariant("primary")}
                  label="Primary version"
                  sublabel="the one we'd cook first"
                />
                <VariantTab
                  active={activeVariant === "alternate"}
                  onClick={() => setActiveVariant("alternate")}
                  label="Alternate take"
                  sublabel="a different set of swaps"
                />
              </div>

              {currentVariant && (
                <div key={activeVariant} className="fade-up">
                  <h2 style={{ marginBottom: 6 }}>{currentVariant.title}</h2>
                  {currentVariant.tradeoff_summary && (
                    <p style={{
                      fontSize: 14,
                      color: "var(--ink-soft)",
                      marginTop: 0,
                      marginBottom: 28,
                      lineHeight: 1.55,
                    }}>
                      {currentVariant.tradeoff_summary}
                    </p>
                  )}

                  {/* Ingredients */}
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{
                      fontSize: 13,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--terracotta)",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 700,
                      marginBottom: 12,
                    }}>
                      Ingredients
                    </h3>
                    <ul style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}>
                      {currentVariant.ingredients.map((ing, i) => (
                        <li key={i} style={{
                          padding: "8px 0",
                          borderBottom: i < currentVariant.ingredients.length - 1 ? "1px dashed var(--paper-edge)" : "none",
                          fontSize: 14,
                          color: "var(--ink)",
                        }}>
                          <span style={{
                            display: "inline-block",
                            width: 20,
                            color: "var(--ink-mute)",
                            fontFamily: "Fraunces, serif",
                            fontStyle: "italic",
                            fontSize: 12,
                          }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{
                      fontSize: 13,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--terracotta)",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 700,
                      marginBottom: 12,
                    }}>
                      Method
                    </h3>
                    <ol style={{ margin: 0, padding: 0, listStyle: "none", counterReset: "step" }}>
                      {currentVariant.steps.map((step, i) => (
                        <li key={i} style={{
                          display: "flex",
                          gap: 16,
                          padding: "10px 0",
                          fontSize: 15,
                          lineHeight: 1.6,
                        }}>
                          <span style={{
                            flexShrink: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--sage-wash)",
                            color: "var(--sage)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "Fraunces, serif",
                            marginTop: 2,
                          }}>
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Changes */}
                  {currentVariant.changes.length > 0 && (
                    <div style={{
                      padding: 20,
                      background: "var(--cream-deep)",
                      borderRadius: 2,
                    }}>
                      <h3 style={{
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--sage)",
                        fontFamily: "DM Sans, sans-serif",
                        fontWeight: 700,
                        marginBottom: 14,
                      }}>
                        What changed & why
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {currentVariant.changes.map((c, i) => (
                          <div key={i} style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: 14,
                            alignItems: "start",
                          }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "Fraunces, serif",
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--terracotta)",
                              border: "1px solid var(--paper-edge)",
                            }}>
                              {i + 1}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, marginBottom: 3 }}>
                                <span style={{ color: "var(--ink-mute)", textDecoration: "line-through" }}>
                                  {c.original_ingredient}
                                </span>
                                <span style={{ color: "var(--ink-mute)", margin: "0 8px" }}>→</span>
                                <strong style={{ color: "var(--ink)" }}>{c.replacement}</strong>
                              </div>
                              <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 4 }}>
                                {c.reason}
                              </div>
                              <div style={{
                                fontSize: 10,
                                color: "var(--ink-mute)",
                                fontFamily: "ui-monospace, monospace",
                                letterSpacing: "0.05em",
                              }}>
                                src · {c.swap_id}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer disclaimer */}
              <div style={{
                marginTop: 40,
                paddingTop: 20,
                borderTop: "1px solid var(--paper-edge)",
                fontSize: 11,
                color: "var(--ink-mute)",
                lineHeight: 1.6,
                fontStyle: "italic",
                fontFamily: "Fraunces, serif",
              }}>
                Substitutions are drawn from a curated database. Always verify labels for allergens. This tool assists cooking decisions; it does not replace medical or allergy advice.
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 14,
    }}>
      <span style={{
        fontFamily: "Fraunces, serif",
        fontStyle: "italic",
        fontSize: 13,
        color: "var(--terracotta)",
      }}>
        № {num}
      </span>
      <h3 style={{
        fontSize: 13,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--ink)",
        fontFamily: "DM Sans, sans-serif",
        fontWeight: 700,
      }}>
        {title}
      </h3>
    </div>
  );
}

function VariantTab({ active, onClick, label, sublabel }: {
  active: boolean; onClick: () => void; label: string; sublabel: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 18px",
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--terracotta)" : "2px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        color: active ? "var(--ink)" : "var(--ink-mute)",
        transition: "all 0.15s",
        marginBottom: -1,
      }}
    >
      <div style={{
        fontFamily: "Fraunces, serif",
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 2,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 12,
        color: "var(--ink-mute)",
        fontStyle: "italic",
        fontFamily: "Fraunces, serif",
      }}>
        {sublabel}
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div style={{
      padding: "80px 32px",
      textAlign: "center",
      background: "var(--cream-deep)",
      borderRadius: 2,
    }}>
      <div style={{ marginBottom: 20 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: "0 auto", display: "block" }}>
          <circle cx="32" cy="32" r="28" stroke="var(--terracotta)" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d="M22 32 Q28 24 32 28 Q36 32 42 28" stroke="var(--terracotta)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <circle cx="26" cy="26" r="1.5" fill="var(--terracotta)" />
          <circle cx="38" cy="26" r="1.5" fill="var(--terracotta)" />
        </svg>
      </div>
      <h3 style={{ fontSize: 22, marginBottom: 8 }}>Ready when you are</h3>
      <p style={{
        color: "var(--ink-soft)",
        fontSize: 14,
        fontStyle: "italic",
        fontFamily: "Fraunces, serif",
        margin: 0,
      }}>
        Pick your constraints, hit &quot;Adapt.&quot; Your recipe lands here.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{
      padding: "80px 32px",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "Fraunces, serif",
        fontStyle: "italic",
        fontSize: 18,
        color: "var(--ink-soft)",
        marginBottom: 16,
      }}>
        Tasting the options<span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
      </div>
      <div style={{
        width: 240,
        height: 1,
        background: "var(--paper-edge)",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          height: "100%",
          width: 80,
          background: "var(--terracotta)",
          animation: "slide 1.8s infinite ease-in-out",
        }} />
      </div>
      <style>{`
        @keyframes slide {
          0% { left: -80px; }
          100% { left: 240px; }
        }
      `}</style>
    </div>
  );
}

function IllustrationFallback() {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--cream-deep) 0%, var(--terracotta-wash) 100%)",
    }}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="70" r="35" stroke="var(--terracotta)" strokeWidth="2" />
        <ellipse cx="60" cy="40" rx="18" ry="8" stroke="var(--terracotta)" strokeWidth="2" />
        <path d="M50 40 Q50 30 55 25 Q60 22 65 25 Q70 30 70 40" stroke="var(--terracotta)" strokeWidth="2" fill="none" />
        <path d="M45 70 Q60 80 75 70" stroke="var(--terracotta-deep)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}
