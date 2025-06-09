import { ref, onMounted, onBeforeUnmount } from "vue";

interface PickOptions {
  accept?: string;
  multiple?: boolean;
}

/**
 * Opens a file dialog
 * @returns openDialog - Used to open the file dialog
 * @returns files - List of file selected in the dialog
 */
export function useFileDialog() {
  const inputRef = ref<HTMLInputElement | null>(null);
  const files = ref<File[]>([]);

  onMounted(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.hidden = true;
    input.className = "hidden";
    document.body.appendChild(input);
    inputRef.value = input;
  });

  onBeforeUnmount(() => {
    inputRef.value?.remove();
  });

  /**
   * Opens a file dialog
   * @param opts Options passed to the file input
   */
  function openDialog(opts?: PickOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!inputRef.value) {
        files.value = [];
        return;
      }

      if (opts?.accept) {
        inputRef.value.accept = opts.accept;
      }
      inputRef.value.multiple = opts?.multiple ?? false;

      inputRef.value.onchange = (e) => {
        const fileList = (e.target as HTMLInputElement).files;
        files.value = fileList ? Array.from(fileList) : [];

        if (inputRef.value) {
          inputRef.value.onchange = null;
        }
        resolve();
      };

      inputRef.value.click();
    });
  }

  return {
    openDialog,
    files,
    _input: inputRef,
  };
}
