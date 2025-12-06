
// AI features have been disabled.
// This service file is kept as a placeholder to prevent build errors if imported elsewhere,
// but it performs no operations.

export const analyzeSEO = async (title: string, content: string) => {
  return {
    score: 0,
    keywords: [],
    suggestions: [],
    metaDescription: ""
  };
};

export const generateArticleImage = async (prompt: string): Promise<string | null> => {
  return null;
};

export const proofreadContent = async (content: string): Promise<string> => {
  return content;
};
