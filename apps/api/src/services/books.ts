/**
 * Kitap durumu kuralları — web tarafındaki lib/bookStatus.ts ile aynı mantık:
 *
 *   bitiş tarihi (endDate ya da eski dateRead) varsa  → okundu (completed)
 *   değilse wantToRead işaretliyse                    → okumak istiyorum
 *   ikisi de değilse                                  → okunuyor (inProgress)
 *
 * Veritabanında bayraklar bu kurala göre tutarlı saklanır ki filtreler ve
 * istatistikler tek bir alana bakarak doğru çalışsın.
 */

type StatusFields = {
  isCompleted?: boolean;
  wantToRead?: boolean;
  endDate?: Date | null;
  dateRead?: Date | null;
};

/**
 * Yazılacak veriyi (mevcut kayıtla birleştirerek) tutarlı hâle getirir ve
 * yalnızca değişmesi gereken alanları döndürür; çağıran bunları `data`ya katar.
 *
 * - endDate ve dateRead birbirinin aynısı tutulur (dateRead eski alan).
 * - Bitiş tarihi olan kitap isCompleted=true, wantToRead=false olur.
 * - isCompleted=false gönderilip tarih gönderilmezse bitiş tarihi temizlenir;
 *   yoksa kitap tarih yüzünden "okundu" görünmeye devam ederdi.
 */
export function normalizeStatus(
  input: StatusFields,
  existing: StatusFields = {},
): StatusFields {
  const out: StatusFields = {};

  const dateSent = input.endDate !== undefined || input.dateRead !== undefined;

  if (input.isCompleted === false && !dateSent) {
    out.endDate = null;
    out.dateRead = null;
  }

  if (dateSent) {
    const finishedOn =
      input.endDate !== undefined ? input.endDate : (input.dateRead ?? null);
    out.endDate = finishedOn;
    out.dateRead = finishedOn;
  }

  const endDate =
    out.endDate !== undefined ? out.endDate : (existing.endDate ?? existing.dateRead ?? null);
  const isCompleted =
    Boolean(endDate) || (input.isCompleted ?? existing.isCompleted ?? false);

  out.isCompleted = isCompleted;
  if (isCompleted) out.wantToRead = false;

  return out;
}

/** Listeleme filtresi: "okundu" kararı bayraktan ya da tarihten gelebilir. */
export function statusWhere(
  status: "all" | "completed" | "inProgress" | "wantToRead",
) {
  const finished = {
    OR: [
      { isCompleted: true },
      { endDate: { not: null } },
      { dateRead: { not: null } },
    ],
  };
  const notFinished = {
    isCompleted: false,
    endDate: null,
    dateRead: null,
  };

  switch (status) {
    case "completed":
      return finished;
    case "wantToRead":
      return { ...notFinished, wantToRead: true };
    case "inProgress":
      return { ...notFinished, wantToRead: false };
    default:
      return {};
  }
}

/** "2026-01-31" ya da ISO zaman; geçersizse undefined. */
export function parseTimestamp(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
