var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+safe", {
    "+safe": function(url, host, scheme) {
        "use strict";
        if (/(?:^|\.)dawang\.la$/.test(host)) return "+proxy";
        if (/(?:^|\.)dw.*\.com$/.test(host)) return "+proxy";
        return "DIRECT";
    },
    "+proxy": function(url, host, scheme) {
        "use strict";
        return "SOCKS5 127.0.0.1:21864; SOCKS 127.0.0.1:21864; DIRECT;";
    }
});
