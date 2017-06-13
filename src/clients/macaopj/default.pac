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
        if (/(?:^|\.)p5900\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5901\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5902\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5903\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5904\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5905\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5906\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5907\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5908\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5909\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5910\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5911\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5912\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5913\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5914\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5915\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5916\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5917\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5918\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p5919\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p960000\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p961111\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p962222\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p963333\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p964444\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p965555\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p966666\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p967777\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p968888\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p969999\.COM$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9601\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9602\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9603\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9604\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9605\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9606\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9607\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9608\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)p9609\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)69619\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)P59\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)479078\.com$/gi.test(host)) return "+proxy";
        if (/(?:^|\.)481408\.com$/gi.test(host)) return "+proxy";
        return "DIRECT";
    },
    "+proxy": function(url, host, scheme) {
        "use strict";
        return "SOCKS5 127.0.0.1:21867; SOCKS 127.0.0.1:21867; DIRECT;";
    }
});
