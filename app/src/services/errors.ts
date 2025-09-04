// Transforme les erreurs API au format standard { error, details? } en un message lisible
export function extractApiError(e: any): { message: string; fieldErrors?: Record<string, string[]> } {
  const status = e?.response?.status;
  const data = e?.response?.data;
  if (data?.error) {
    // details peut être un flatten() de Zod: { formErrors:[], fieldErrors:{...} }
    const fieldErrors: Record<string, string[]> | undefined = data?.details?.fieldErrors;
    const formErrors: string[] | undefined = data?.details?.formErrors;
    const message = formErrors || data.error || `HTTP ${status || ''}`.trim();
    return { message, fieldErrors };
  }
  return { message: e?.message || 'Erreur réseau' };
}
