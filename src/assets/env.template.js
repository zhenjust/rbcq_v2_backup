(function (window) {
    window.__env = window.__env || {};

    // These will be replaced by Docker/K8s at container start
    window.__env.__API_URL__ = "$API_BASE_URL";
    window.__env.__CLOUD_API_URL__ = "$API_BASE_CLOUD_URL";
    window.__env.__PHASE_ONE_URL__ = "$PHASE_ONE_URL";
    window.__env.__PHASE_TWO_URL__ = "$PHASE_TWO_URL";

    console.log(window.__env)
})(this);
