const nextConfig = {
    reactStrictMode: false,
    compiler: {
        styledComponents: true
    },
    output: 'standalone',

    // transpilePackages: ['@downstream/core'],

    webpack: (config, options) => {
        // stub out the fs module, as we have some escripten
        // compiled wasm that thinks it's running outside browser
        // during compilation
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false
        };
        return config;
    }
};

export default nextConfig;
