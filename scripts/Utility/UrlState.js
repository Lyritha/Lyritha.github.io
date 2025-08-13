export function get() {
    const url = new URL(window.location);
    const params = {};
    for (const [key, value] of url.searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

export function set({ params }) {
    const url = new URL(window.location);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value != null) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });

    window.history.replaceState({}, '', url);
}