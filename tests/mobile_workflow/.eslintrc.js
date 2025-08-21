module.exports = {
  root: true,
  extends: ['@react-native'],
  rules: {
    // Vous pouvez ajouter des règles personnalisées ici
    'prettier/prettier': 0, // Désactive prettier si vous ne l'utilisez pas
  },
  env: {
    jest: true,
  },
};
