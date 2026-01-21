export default {
  viteFinal: (config) => {
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "lucide-react",
    ];
    return config;
  },
};
