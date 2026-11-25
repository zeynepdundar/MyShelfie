'use client';
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, FileUp, X } from "lucide-react";
import type { Book } from "@shelfie/types";

import { Button } from "@/components/ui/button";
import { useImportBooks } from "@/lib/booksQueries";
import {
  CsvFormatError,
  IMPORT_LIMIT,
  buildImport,
  type ImportPreview,
} from "@/lib/importCsv";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Kütüphanedeki kitaplar: aynı kitap ikinci kez eklenmesin. */
  existingBooks: Book[];
}

type Step =
  | { kind: "pick" }
  | { kind: "preview"; fileName: string; preview: ImportPreview }
  | { kind: "importing" }
  | { kind: "done"; count: number };

/** MB; API gövde sınırı 5 MB, CSV'nin JSON'u biraz daha büyük olur. */
const MAX_FILE_MB = 3;

export function ImportCsvModal({ isOpen, onClose, existingBooks }: ImportCsvModalProps) {
  const t = useTranslations("importCsv");
  // Bitince kitap listesi kendiliğinden yeniden çekilir (booksQueries).
  const importBooks = useImportBooks();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const close = () => {
    if (step.kind === "importing") return;
    onClose();
  };

  const readFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t("errors.tooLarge", { mb: MAX_FILE_MB }));
      return;
    }
    try {
      const preview = buildImport(await file.text(), existingBooks);
      setStep({ kind: "preview", fileName: file.name, preview });
    } catch (err) {
      setError(
        err instanceof CsvFormatError
          ? t(`errors.${err.reason}`, { limit: IMPORT_LIMIT })
          : t("errors.unreadable")
      );
    }
  };

  const runImport = async (preview: ImportPreview) => {
    setStep({ kind: "importing" });
    setError(null);
    try {
      const count = await importBooks.mutateAsync(preview.books);
      setStep({ kind: "done", count });
    } catch (err) {
      console.error("[importCsv]", err);
      // İstek tek transaction: başarısızsa hiçbir kitap eklenmedi.
      setStep({ kind: "preview", fileName: "", preview });
      setError(t("errors.failed"));
    }
  };

  return (
    <div className="sf-modal-overlay" role="dialog" aria-modal="true" onClick={close}>
      <div className="sf-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="sf-modal-header">
          <div>
            <h2 className="sf-title-section">{t("title")}</h2>
            <p className="sf-muted mt-1">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="sf-icon-button"
            disabled={step.kind === "importing"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="sf-modal-body space-y-4">
          {step.kind === "pick" && (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) void readFile(file);
                }}
                className="sf-tile flex w-full cursor-pointer flex-col items-center gap-2 border border-dashed border-white/20 py-8 text-center transition-colors duration-200 hover:bg-control-hover"
              >
                <FileUp className="h-6 w-6 text-white/70" />
                <span className="sf-body">{t("pick")}</span>
                <span className="sf-meta">{t("pickHint")}</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void readFile(file);
                }}
              />
              <p className="sf-meta">{t("formats")}</p>
            </>
          )}

          {step.kind === "preview" && (
            <>
              {step.fileName && <p className="sf-meta truncate">{step.fileName}</p>}
              <ul className="sf-tile space-y-1">
                <li className="sf-body">{t("summary.ready", { count: step.preview.books.length })}</li>
                {step.preview.duplicates > 0 && (
                  <li className="sf-meta">{t("summary.duplicates", { count: step.preview.duplicates })}</li>
                )}
                {step.preview.problems.length > 0 && (
                  <li className="sf-meta">
                    {t("summary.skipped", {
                      count: step.preview.problems.length,
                      lines: step.preview.problems
                        .slice(0, 5)
                        .map((p) => p.line)
                        .join(", "),
                    })}
                  </li>
                )}
              </ul>

              {step.preview.books.length > 0 && (
                <div className="space-y-2">
                  <p className="sf-label">{t("sample")}</p>
                  <ul className="space-y-1">
                    {step.preview.books.slice(0, 5).map((book, i) => (
                      <li key={i} className="sf-body truncate">
                        {book.title} <span className="sf-muted">· {book.author}</span>
                      </li>
                    ))}
                  </ul>
                  {step.preview.books.length > 5 && (
                    <p className="sf-meta">{t("more", { count: step.preview.books.length - 5 })}</p>
                  )}
                </div>
              )}
            </>
          )}

          {step.kind === "importing" && (
            <div className="flex items-center gap-3 py-4">
              <span className="sf-spinner" aria-hidden />
              <span className="sf-body">{t("importing")}</span>
            </div>
          )}

          {step.kind === "done" && (
            <div className="flex items-center gap-3 py-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <span className="sf-body">{t("done", { count: step.count })}</span>
            </div>
          )}

          {error && <div className="sf-alert-error">{error}</div>}
        </div>

        <div className="sf-modal-footer sm:justify-end">
          {step.kind === "preview" && (
            <>
              <Button type="button" variant="outline" onClick={() => setStep({ kind: "pick" })}>
                {t("back")}
              </Button>
              <Button
                type="button"
                onClick={() => void runImport(step.preview)}
                disabled={step.preview.books.length === 0}
              >
                {t("confirm", { count: step.preview.books.length })}
              </Button>
            </>
          )}
          {(step.kind === "pick" || step.kind === "done") && (
            <Button type="button" variant="outline" onClick={close}>
              {step.kind === "done" ? t("finish") : t("cancel")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
