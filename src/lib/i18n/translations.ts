/**
 * Translation helper.
 * Uses Google Translate API for dynamic translations and
 * static dictionaries for common UI strings.
 */

import type { Locale } from "./config";

// ── Static translations for common UI strings ───────────────────────

const staticTranslations: Record<string, Record<Locale, string>> = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard", es: "Panel", fr: "Tableau de bord", de: "Dashboard",
    pt: "Painel", ja: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9", zh: "\u4eea\u8868\u677f", ar: "\u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a", ko: "\ub300\uc2dc\ubcf4\ub4dc", ru: "\u041f\u0430\u043d\u0435\u043b\u044c",
  },
  "nav.surveys": {
    en: "Surveys", es: "Encuestas", fr: "Sondages", de: "Umfragen",
    pt: "Pesquisas", ja: "\u30a2\u30f3\u30b1\u30fc\u30c8", zh: "\u8c03\u67e5", ar: "\u0627\u0633\u062a\u0637\u0644\u0627\u0639\u0627\u062a", ko: "\uc124\ubb38\uc870\uc0ac", ru: "\u041e\u043f\u0440\u043e\u0441\u044b",
  },
  "nav.templates": {
    en: "Templates", es: "Plantillas", fr: "Mod\u00e8les", de: "Vorlagen",
    pt: "Modelos", ja: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8", zh: "\u6a21\u677f", ar: "\u0642\u0648\u0627\u0644\u0628", ko: "\ud15c\ud50c\ub9bf", ru: "\u0428\u0430\u0431\u043b\u043e\u043d\u044b",
  },
  "nav.delphi": {
    en: "Delphi Studies", es: "Estudios Delphi", fr: "\u00c9tudes Delphi", de: "Delphi-Studien",
    pt: "Estudos Delphi", ja: "\u30c7\u30eb\u30d5\u30a1\u30a4\u7814\u7a76", zh: "\u5fb7\u5c14\u83f2\u7814\u7a76", ar: "\u062f\u0631\u0627\u0633\u0627\u062a \u062f\u0644\u0641\u064a", ko: "\ub378\ud30c\uc774 \uc5f0\uad6c", ru: "\u0418\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0414\u0435\u043b\u044c\u0444\u0438",
  },
  "nav.aiStudio": {
    en: "AI Studio", es: "Estudio IA", fr: "Studio IA", de: "KI-Studio",
    pt: "Est\u00fadio IA", ja: "AI\u30b9\u30bf\u30b8\u30aa", zh: "AI\u5de5\u4f5c\u5ba4", ar: "\u0627\u0633\u062a\u0648\u062f\u064a\u0648 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a", ko: "AI \uc2a4\ud29c\ub514\uc624", ru: "AI \u0421\u0442\u0443\u0434\u0438\u044f",
  },
  "nav.analytics": {
    en: "Analytics", es: "An\u00e1lisis", fr: "Analytique", de: "Analytik",
    pt: "An\u00e1lise", ja: "\u5206\u6790", zh: "\u5206\u6790", ar: "\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a", ko: "\ubd84\uc11d", ru: "\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
  },
  "nav.settings": {
    en: "Settings", es: "Configuraci\u00f3n", fr: "Param\u00e8tres", de: "Einstellungen",
    pt: "Configura\u00e7\u00f5es", ja: "\u8a2d\u5b9a", zh: "\u8bbe\u7f6e", ar: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a", ko: "\uc124\uc815", ru: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
  },
  "nav.integrations": {
    en: "Integrations", es: "Integraciones", fr: "Int\u00e9grations", de: "Integrationen",
    pt: "Integra\u00e7\u00f5es", ja: "\u7d71\u5408", zh: "\u96c6\u6210", ar: "\u0627\u0644\u062a\u0643\u0627\u0645\u0644\u0627\u062a", ko: "\ud1b5\ud569", ru: "\u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438",
  },

  // Common actions
  "action.save": {
    en: "Save", es: "Guardar", fr: "Enregistrer", de: "Speichern",
    pt: "Salvar", ja: "\u4fdd\u5b58", zh: "\u4fdd\u5b58", ar: "\u062d\u0641\u0638", ko: "\uc800\uc7a5", ru: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c",
  },
  "action.cancel": {
    en: "Cancel", es: "Cancelar", fr: "Annuler", de: "Abbrechen",
    pt: "Cancelar", ja: "\u30ad\u30e3\u30f3\u30bb\u30eb", zh: "\u53d6\u6d88", ar: "\u0625\u0644\u063a\u0627\u0621", ko: "\ucde8\uc18c", ru: "\u041e\u0442\u043c\u0435\u043d\u0430",
  },
  "action.delete": {
    en: "Delete", es: "Eliminar", fr: "Supprimer", de: "L\u00f6schen",
    pt: "Excluir", ja: "\u524a\u9664", zh: "\u5220\u9664", ar: "\u062d\u0630\u0641", ko: "\uc0ad\u0c81", ru: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
  },
  "action.edit": {
    en: "Edit", es: "Editar", fr: "Modifier", de: "Bearbeiten",
    pt: "Editar", ja: "\u7de8\u96c6", zh: "\u7f16\u8f91", ar: "\u062a\u0639\u062f\u064a\u0644", ko: "\ud3b8\uc9d1", ru: "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
  },
  "action.create": {
    en: "Create", es: "Crear", fr: "Cr\u00e9er", de: "Erstellen",
    pt: "Criar", ja: "\u4f5c\u6210", zh: "\u521b\u5efa", ar: "\u0625\u0646\u0634\u0627\u0621", ko: "\ub9cc\ub4e4\uae30", ru: "\u0421\u043e\u0437\u0434\u0430\u0442\u044c",
  },
  "action.submit": {
    en: "Submit", es: "Enviar", fr: "Soumettre", de: "Absenden",
    pt: "Enviar", ja: "\u9001\u4fe1", zh: "\u63d0\u4ea4", ar: "\u0625\u0631\u0633\u0627\u0644", ko: "\uc81c\ucd9c", ru: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c",
  },
  "action.back": {
    en: "Back", es: "Volver", fr: "Retour", de: "Zur\u00fcck",
    pt: "Voltar", ja: "\u623b\u308b", zh: "\u8fd4\u56de", ar: "\u0631\u062c\u0648\u0639", ko: "\ub4a4\ub85c", ru: "\u041d\u0430\u0437\u0430\u0434",
  },
  "action.next": {
    en: "Next", es: "Siguiente", fr: "Suivant", de: "Weiter",
    pt: "Pr\u00f3ximo", ja: "\u6b21\u3078", zh: "\u4e0b\u4e00\u6b65", ar: "\u0627\u0644\u062a\u0627\u0644\u064a", ko: "\ub2e4\uc74c", ru: "\u0414\u0430\u043b\u0435\u0435",
  },
  "action.search": {
    en: "Search", es: "Buscar", fr: "Rechercher", de: "Suchen",
    pt: "Pesquisar", ja: "\u691c\u7d22", zh: "\u641c\u7d22", ar: "\u0628\u062d\u062b", ko: "\uac80\uc0c9", ru: "\u041f\u043e\u0438\u0441\u043a",
  },

  // Survey
  "survey.title": {
    en: "Survey Title", es: "T\u00edtulo de la encuesta", fr: "Titre du sondage", de: "Umfragetitel",
    pt: "T\u00edtulo da pesquisa", ja: "\u30a2\u30f3\u30b1\u30fc\u30c8\u30bf\u30a4\u30c8\u30eb", zh: "\u8c03\u67e5\u6807\u9898", ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0627\u0633\u062a\u0637\u0644\u0627\u0639", ko: "\uc124\ubb38\uc870\uc0ac \uc81c\ubaa9", ru: "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043e\u043f\u0440\u043e\u0441\u0430",
  },
  "survey.description": {
    en: "Description", es: "Descripci\u00f3n", fr: "Description", de: "Beschreibung",
    pt: "Descri\u00e7\u00e3o", ja: "\u8aac\u660e", zh: "\u63cf\u8ff0", ar: "\u0627\u0644\u0648\u0635\u0641", ko: "\uc124\uba85", ru: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
  },
  "survey.status.draft": {
    en: "Draft", es: "Borrador", fr: "Brouillon", de: "Entwurf",
    pt: "Rascunho", ja: "\u4e0b\u66f8\u304d", zh: "\u8349\u7a3f", ar: "\u0645\u0633\u0648\u062f\u0629", ko: "\ucd08\uc548", ru: "\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a",
  },
  "survey.status.active": {
    en: "Active", es: "Activa", fr: "Active", de: "Aktiv",
    pt: "Ativa", ja: "\u30a2\u30af\u30c6\u30a3\u30d6", zh: "\u6d3b\u52a8\u4e2d", ar: "\u0646\u0634\u0637", ko: "\ud65c\uc131", ru: "\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0439",
  },
  "survey.status.closed": {
    en: "Closed", es: "Cerrada", fr: "Ferm\u00e9e", de: "Geschlossen",
    pt: "Encerrada", ja: "\u7d42\u4e86", zh: "\u5df2\u5173\u95ed", ar: "\u0645\u063a\u0644\u0642", ko: "\ub9c8\uac10", ru: "\u0417\u0430\u043a\u0440\u044b\u0442",
  },
  "survey.responses": {
    en: "Responses", es: "Respuestas", fr: "R\u00e9ponses", de: "Antworten",
    pt: "Respostas", ja: "\u56de\u7b54", zh: "\u56de\u590d", ar: "\u0627\u0644\u0631\u062f\u0648\u062f", ko: "\uc751\ub2f5", ru: "\u041e\u0442\u0432\u0435\u0442\u044b",
  },

  // AI Studio
  "ai.generate": {
    en: "Generate with AI", es: "Generar con IA", fr: "G\u00e9n\u00e9rer avec l'IA", de: "Mit KI generieren",
    pt: "Gerar com IA", ja: "AI\u3067\u751f\u6210", zh: "AI\u751f\u6210", ar: "\u0627\u0644\u062a\u0648\u0644\u064a\u062f \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a", ko: "AI\ub85c \uc0dd\uc131", ru: "\u0413\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u044f \u0441 AI",
  },
  "ai.voiceBuilder": {
    en: "Voice Builder", es: "Constructor de Voz", fr: "Constructeur Vocal", de: "Sprach-Builder",
    pt: "Construtor de Voz", ja: "\u97f3\u58f0\u30d3\u30eb\u30c0\u30fc", zh: "\u8bed\u97f3\u6784\u5efa\u5668", ar: "\u0645\u0646\u0634\u0626 \u0627\u0644\u0635\u0648\u062a", ko: "\uc74c\uc131 \ube4c\ub354", ru: "\u0413\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0439 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440",
  },
  "ai.chat": {
    en: "AI Chat", es: "Chat IA", fr: "Chat IA", de: "KI-Chat",
    pt: "Chat IA", ja: "AI\u30c1\u30e3\u30c3\u30c8", zh: "AI\u804a\u5929", ar: "\u0645\u062d\u0627\u062f\u062b\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a", ko: "AI \ucc44\ud305", ru: "AI \u0427\u0430\u0442",
  },

  // Common
  "common.loading": {
    en: "Loading...", es: "Cargando...", fr: "Chargement...", de: "Laden...",
    pt: "Carregando...", ja: "\u8aad\u307f\u8fbc\u307f\u4e2d...", zh: "\u52a0\u8f7d\u4e2d...", ar: "\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0645\u064a\u0644...", ko: "\ub85c\ub529 \uc911...", ru: "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...",
  },
  "common.error": {
    en: "Error", es: "Error", fr: "Erreur", de: "Fehler",
    pt: "Erro", ja: "\u30a8\u30e9\u30fc", zh: "\u9519\u8bef", ar: "\u062e\u0637\u0623", ko: "\uc624\u0440", ru: "\u041e\u0448\u0438\u0431\u043a\u0430",
  },
  "common.noData": {
    en: "No data available", es: "No hay datos disponibles", fr: "Aucune donn\u00e9e disponible", de: "Keine Daten verf\u00fcgbar",
    pt: "Nenhum dado dispon\u00edvel", ja: "\u30c7\u30fc\u30bf\u304c\u3042\u308a\u307e\u305b\u3093", zh: "\u6ca1\u6709\u53ef\u7528\u6570\u636e", ar: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a", ko: "\ub370\uc774\ud130 \uc5c6\uc74c", ru: "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445",
  },
  "common.confirmDelete": {
    en: "Are you sure you want to delete this?", es: "\u00bfEst\u00e1s seguro de que quieres eliminar esto?", fr: "\u00cates-vous s\u00fbr de vouloir supprimer ceci ?", de: "Sind Sie sicher, dass Sie dies l\u00f6schen m\u00f6chten?",
    pt: "Tem certeza de que deseja excluir isso?", ja: "\u672c\u5f53\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f", zh: "\u786e\u5b9a\u8981\u5220\u9664\u5417\uff1f", ar: "\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0623\u0646\u0643 \u062a\u0631\u064a\u062f \u062d\u0630\u0641 \u0647\u0630\u0627\u061f", ko: "\uc815\ub9d0 \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?", ru: "\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e?",
  },
  "common.thankYou": {
    en: "Thank you!", es: "\u00a1Gracias!", fr: "Merci !", de: "Danke!",
    pt: "Obrigado!", ja: "\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\uff01", zh: "\u8c22\u8c22\uff01", ar: "\u0634\u0643\u0631\u0627\u064b!", ko: "\uac10\uc0ac\ud569\ub2c8\ub2e4!", ru: "\u0421\u043f\u0430\u0441\u0438\u0431\u043e!",
  },
};

/**
 * Get a static translation by key.
 */
export function t(key: string, locale: Locale = "en"): string {
  return staticTranslations[key]?.[locale] ?? staticTranslations[key]?.en ?? key;
}

/**
 * Translate text dynamically via the API.
 */
export async function translateText(
  text: string | string[],
  targetLang: string,
  sourceLang?: string
): Promise<string | string[]> {
  try {
    const res = await fetch("/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang, sourceLang }),
    });

    if (!res.ok) throw new Error("Translation failed");

    const data = await res.json();

    if (Array.isArray(text)) {
      return data.translations?.map((t: { text: string }) => t.text) ?? text;
    }

    return data.translation ?? text;
  } catch {
    console.error("Translation failed, returning original text");
    return text;
  }
}
