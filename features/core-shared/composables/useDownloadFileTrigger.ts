export type File = {
  fileName: string;
  fileContent: Blob;
};

export function useDownloadFileTrigger() {
  const downloadAnchor = document.createElement("a");

  onMounted(() => {
    document.body.appendChild(downloadAnchor);
  });

  onUnmounted(() => {
    document.body.removeChild(downloadAnchor);
  });

  return {
    triggerBrowserDownload,
  };

  function triggerBrowserDownload(file: File) {
    downloadAnchor.setAttribute("download", file.fileName);
    downloadAnchor.href = URL.createObjectURL(file.fileContent);

    downloadAnchor.click();
  }
}
