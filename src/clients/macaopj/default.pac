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
        if (/(?:^|\.)p59[0|1]\d\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p960\d\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)69619\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)479078\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)481408\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)P59\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p960{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p961{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p962{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p963{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p964{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p965{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p966{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p967{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p968{4}\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p969{4}\.com$/gi.test(host)) return "+proxy";
        return "DIRECT";
    },
    "+proxy": function(url, host, scheme) {
        "use strict";
        return "SOCKS5 127.0.0.1:21867; SOCKS 127.0.0.1:21867; DIRECT;";
    }
});
