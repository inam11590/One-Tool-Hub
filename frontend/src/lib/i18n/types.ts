export interface TranslationDictionary {
  common: {
    siteName: string;
    tagline: string;
    description: string;
    allTools: string;
    learningCenter: string;
    categories: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    searchPlaceholder: string;
    searchShortcut: string;
    home: string;
    backToHome: string;
    freeOnlineTools: string;
    offlinePrivate: string;
    language: string;
    switchToEnglish: string;
    switchToUrdu: string;
  };
  navigation: {
    home: string;
    allTools: string;
    categories: string;
    learningCenter: string;
    about: string;
    searchButton: string;
  };
  categories: {
    student: {
      name: string;
      shortName: string;
      description: string;
      audience: string;
    };
    freelancer: {
      name: string;
      shortName: string;
      description: string;
      audience: string;
    };
    youtube: {
      name: string;
      shortName: string;
      description: string;
      audience: string;
    };
    developer: {
      name: string;
      shortName: string;
      description: string;
      audience: string;
    };
  };
  toolUI: {
    run: string;
    reset: string;
    copy: string;
    copied: string;
    download: string;
    upload: string;
    processing: string;
    success: string;
    error: string;
    clear: string;
    dragAndDrop: string;
    privacyNote: string;
    instructions: string;
    examples: string;
    faqs: string;
    features: string;
    overview: string;
    relatedTools: string;
    tutorialGuide: string;
  };
  home: {
    badge: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    exploreAllTools: string;
    viewLearningCenter: string;
    browseByCategory: string;
    browseByCategorySubtitle: string;
    featuredTools: string;
    featuredToolsSubtitle: string;
    whyChooseUs: string;
    whyChooseUsSubtitle: string;
    benefits: {
      speedTitle: string;
      speedDesc: string;
      privacyTitle: string;
      privacyDesc: string;
      freeTitle: string;
      freeDesc: string;
      mobileTitle: string;
      mobileDesc: string;
    };
  };
  directory: {
    title: string;
    subtitle: string;
    filterAll: string;
    searchNoResults: string;
    tryDifferentSearch: string;
    favoriteTools: string;
    recentTools: string;
    clearFavorites: string;
    clearRecent: string;
    noFavoritesYet: string;
    noRecentYet: string;
  };
  learn: {
    title: string;
    subtitle: string;
    readTime: string;
    minRead: string;
    exploreTutorials: string;
    backToTutorials: string;
    relatedTutorials: string;
    openTool: string;
    keyTakeaways: string;
    stepByStep: string;
    practicalExample: string;
    commonMistakes: string;
    troubleshooting: string;
  };
}
