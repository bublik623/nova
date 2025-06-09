import { isoDuration as _isoDuration, en } from "@musement/iso-duration";
import { DurationObj } from "@musement/iso-duration/dist/types/types";

export default defineNuxtPlugin(() => {
  _isoDuration.setLocales({
    en,
  });

  return {
    provide: {
      isoDuration,
    },
  };

  function isoDuration(duration: string | Partial<DurationObj>) {
    return _isoDuration(duration);
  }
});
