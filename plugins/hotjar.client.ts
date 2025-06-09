import Hotjar from "@hotjar/browser";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (!config.public.DISABLE_HOTJAR) {
    const siteId = 3457766; // Unique identifier for Nova website in Hotjar

    Hotjar.init(siteId, 6);
  } else {
    // eslint-disable-next-line no-console
    console.log(
      "%c 🔥 HotJar Tracking Disabled 🔥",
      "color: #fff; background: #35495d; font-size: 12px; border-radius: 5px; padding: 10px 5px; margin: 10px 0;"
    );
  }
});
