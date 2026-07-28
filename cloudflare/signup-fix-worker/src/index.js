const INJECTED_STYLE = `
<style id="signup-no-blur-override">
.signup-motion-text .signup-word,
.signup-motion-text .signup-word--soft-rise,
.signup-motion-text .signup-word--fall,
.signup-motion-text .signup-word--drift,
.signup-motion-text .signup-word--blur,
.signup-motion-text .signup-word--water,
.signup-motion-text .signup-word--hook-fall,
.signup-motion-text .signup-word--hook-water,
.signup-motion-text .signup-word--hook-glow,
.signup-motion-text .signup-word.is-in,
.signup-reveal,
.signup-reveal--fade-up,
.signup-reveal--fade-down,
.signup-reveal--fade-left,
.signup-reveal--fade-right,
.signup-reveal--scale-in,
.signup-reveal--blur-up,
.signup-reveal.is-visible {
  -webkit-filter: none !important;
  filter: none !important;
}
</style>
`;

class HeadInjector {
  element(element) {
    element.append(INJECTED_STYLE, { html: true });
  }
}

function buildUpstreamUrl(requestUrl) {
  const upstream = new URL(requestUrl.toString());
  upstream.protocol = "https:";
  upstream.hostname = "app.sauditrend.sa";
  return upstream;
}

export default {
  async fetch(request) {
    const requestUrl = new URL(request.url);
    const upstreamUrl = buildUpstreamUrl(requestUrl);

    const upstreamResponse = await fetch(
      new Request(upstreamUrl, request),
      {
        redirect: "follow",
        headers: request.headers,
      },
    );

    const contentType = upstreamResponse.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return upstreamResponse;
    }

    return new HTMLRewriter()
      .on("head", new HeadInjector())
      .transform(upstreamResponse);
  },
};
