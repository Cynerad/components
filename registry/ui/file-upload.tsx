import { Button } from "@/components/ui/button";
import { useDirection } from "@/components/ui/direction";
import { useAsRef } from "@/hooks/use-as-ref";
import { useLazyRef } from "@/hooks/use-lazy-ref";
import { cn } from "@/lib/utils";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { FileArchiveIcon, FileAudioIcon, FileCodeIcon, FileCogIcon, FileIcon, FileTextIcon, FileVideoIcon } from "lucide-react";
import {
  ClipboardEvent,
  ComponentProps,
  createContext,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

type OrientationType = "horizontal" | "vertical";

type FileStateType = {
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
};

type StoreStateType = {
  files: Map<File, FileStateType>;
  dragOver: boolean;
  invalid: boolean;
};

type StoreActionType =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "SET_FILES"; files: File[] }
  | { type: "SET_PROGRESS"; file: File; progress: number }
  | { type: "SET_SUCCESS"; file: File }
  | { type: "SET_ERROR"; file: File; error: string }
  | { type: "REMOVE_FILE"; file: File }
  | { type: "SET_DRAG_OVER"; dragOver: boolean }
  | { type: "SET_INVALID"; invalid: boolean }
  | { type: "CLEAR" };

type StoreType = {
  getState: () => StoreStateType;
  dispatch: (action: StoreActionType) => void;
  subscribe: (listener: () => void) => () => void;
};

type DirectionType = "ltr" | "rtl";

type FileUploadContextValueType = {
  inputId: string;
  dropzoneId: string;
  listId: string;
  labelId: string;
  disabled: boolean;
  dir: DirectionType;
  inputRef: RefObject<HTMLInputElement | null>;
  urlCache: WeakMap<File, string>;
};

const ROOT_NAME = "FileUpload";
const ITEM_NAME = "FileUploadItem";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
  const type = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("video/")) {
    return <FileVideoIcon />;
  }

  if (type.startsWith("audio/")) {
    return <FileAudioIcon />;
  }

  if (type.startsWith("text/") || ["txt", "md", "rtf", "pdf"].includes(extension)) {
    return <FileTextIcon />;
  }

  if (["html", "css", "js", "jsx", "ts", "tsx", "json", "xml", "php", "py", "rb", "java", "c", "cpp", "cs"].includes(extension)) {
    return <FileCodeIcon />;
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension)) {
    return <FileArchiveIcon />;
  }

  if (["exe", "msi", "app", "apk", "deb", "rpm"].includes(extension) || type.startsWith("application/")) {
    return <FileCogIcon />;
  }

  return <FileIcon />;
}

const StoreContext = createContext<StoreType | null>(null);

function useStoreContext(consumerName: string) {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreStateType) => T): T {
  const store = useStoreContext("useStore");

  const lastValueRef = useLazyRef<{ value: T; state: StoreStateType } | null>(() => null);

  const getSnapshot = useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

const FileUploadContext = createContext<FileUploadContextValueType | null>(null);

function useFileUploadContext(consumerName: string) {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

type FileUploadType = {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: DirectionType;
  label?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
} & Omit<ComponentProps<"div"> & useRender.ComponentProps<"div">, "defaultValue" | "onChange">;

function FileUpload({
  value,
  defaultValue,
  onValueChange,
  onAccept,
  onFileAccept,
  onFileReject,
  onFileValidate,
  onUpload,
  accept,
  maxFiles,
  maxSize,
  dir: dirProp,
  label,
  name,
  render,
  disabled = false,
  invalid = false,
  multiple = false,
  required = false,
  children,
  className,
  ...props
}: FileUploadType) {
  const inputId = useId();
  const dropzoneId = useId();
  const listId = useId();
  const labelId = useId();

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;
  const files = useLazyRef<Map<File, FileStateType>>(() => new Map()).current;
  const urlCache = useLazyRef(() => new WeakMap<File, string>()).current;
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  const listeners = useLazyRef(() => new Set<() => void>()).current;

  const propsRef = useAsRef({
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
  });

  const store = useMemo<StoreType>(() => {
    let state: StoreStateType = {
      files,
      dragOver: false,
      invalid: invalid,
    };

    function reducer(state: StoreStateType, action: StoreActionType): StoreStateType {
      switch (action.type) {
        case "ADD_FILES": {
          for (const file of action.files) {
            files.set(file, {
              file,
              progress: 0,
              status: "idle",
            });
          }

          if (propsRef.current.onValueChange) {
            const fileList = Array.from(files.values()).map((fileState) => fileState.file);
            propsRef.current.onValueChange(fileList);
          }
          return { ...state, files };
        }

        case "SET_FILES": {
          const newFileSet = new Set(action.files);
          for (const existingFile of files.keys()) {
            if (!newFileSet.has(existingFile)) {
              files.delete(existingFile);
            }
          }

          for (const file of action.files) {
            const existingState = files.get(file);
            if (!existingState) {
              files.set(file, {
                file,
                progress: 0,
                status: "idle",
              });
            }
          }
          return { ...state, files };
        }

        case "SET_PROGRESS": {
          const fileState = files.get(action.file);
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              progress: action.progress,
              status: "uploading",
            });
          }
          return { ...state, files };
        }

        case "SET_SUCCESS": {
          const fileState = files.get(action.file);
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              progress: 100,
              status: "success",
            });
          }
          return { ...state, files };
        }

        case "SET_ERROR": {
          const fileState = files.get(action.file);
          if (fileState) {
            files.set(action.file, {
              ...fileState,
              error: action.error,
              status: "error",
            });
          }
          return { ...state, files };
        }

        case "REMOVE_FILE": {
          const cachedUrl = urlCache.get(action.file);
          if (cachedUrl) {
            URL.revokeObjectURL(cachedUrl);
            urlCache.delete(action.file);
          }

          files.delete(action.file);

          if (propsRef.current.onValueChange) {
            const fileList = Array.from(files.values()).map((fileState) => fileState.file);
            propsRef.current.onValueChange(fileList);
          }
          return { ...state, files };
        }

        case "SET_DRAG_OVER": {
          return { ...state, dragOver: action.dragOver };
        }

        case "SET_INVALID": {
          return { ...state, invalid: action.invalid };
        }

        case "CLEAR": {
          for (const file of files.keys()) {
            const cachedUrl = urlCache.get(file);
            if (cachedUrl) {
              URL.revokeObjectURL(cachedUrl);
              urlCache.delete(file);
            }
          }

          files.clear();
          if (propsRef.current.onValueChange) {
            propsRef.current.onValueChange([]);
          }
          return { ...state, files, invalid: false };
        }

        default:
          return state;
      }
    }

    return {
      getState: () => state,
      dispatch: (action) => {
        // eslint-disable-next-line react-hooks/immutability
        state = reducer(state, action);
        for (const listener of listeners) {
          listener();
        }
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  }, [listeners, files, invalid, propsRef, urlCache]);

  const acceptTypes = useMemo(() => accept?.split(",").map((t) => t.trim()) ?? null, [accept]);

  const onProgress = useLazyRef(() => {
    let frame = 0;
    return (file: File, progress: number) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        store.dispatch({
          type: "SET_PROGRESS",
          file,
          progress: Math.min(Math.max(0, progress), 100),
        });
      });
    };
  }).current;

  useEffect(() => {
    if (isControlled) {
      store.dispatch({ type: "SET_FILES", files: value });
    } else if (defaultValue && defaultValue.length > 0 && !store.getState().files.size) {
      store.dispatch({ type: "SET_FILES", files: defaultValue });
    }
  }, [value, defaultValue, isControlled, store]);

  useEffect(() => {
    return () => {
      for (const file of files.keys()) {
        const cachedUrl = urlCache.get(file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
      }
    };
  }, [files, urlCache]);

  const onFilesUpload = useCallback(
    async (files: File[]) => {
      try {
        for (const file of files) {
          store.dispatch({ type: "SET_PROGRESS", file, progress: 0 });
        }

        if (propsRef.current.onUpload) {
          await propsRef.current.onUpload(files, {
            onProgress,
            onSuccess: (file) => {
              store.dispatch({ type: "SET_SUCCESS", file });
            },
            onError: (file, error) => {
              store.dispatch({
                type: "SET_ERROR",
                file,
                error: error.message ?? "Upload failed",
              });
            },
          });
        } else {
          for (const file of files) {
            store.dispatch({ type: "SET_SUCCESS", file });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        for (const file of files) {
          store.dispatch({
            type: "SET_ERROR",
            file,
            error: errorMessage,
          });
        }
      }
    },
    [store, propsRef, onProgress],
  );

  const onFilesChange = useCallback(
    (originalFiles: File[]) => {
      if (disabled) return;

      let filesToProcess = [...originalFiles];
      let invalid = false;

      if (maxFiles) {
        const currentCount = store.getState().files.size;
        const remainingSlotCount = Math.max(0, maxFiles - currentCount);

        if (remainingSlotCount < filesToProcess.length) {
          const rejectedFiles = filesToProcess.slice(remainingSlotCount);
          invalid = true;

          filesToProcess = filesToProcess.slice(0, remainingSlotCount);

          for (const file of rejectedFiles) {
            let rejectionMessage = `Maximum ${maxFiles} files allowed`;

            if (propsRef.current.onFileValidate) {
              const validationMessage = propsRef.current.onFileValidate(file);
              if (validationMessage) {
                rejectionMessage = validationMessage;
              }
            }

            propsRef.current.onFileReject?.(file, rejectionMessage);
          }
        }
      }

      const acceptedFiles: File[] = [];
      const rejectedFiles: { file: File; message: string }[] = [];

      for (const file of filesToProcess) {
        let rejected = false;
        let rejectionMessage = "";

        if (propsRef.current.onFileValidate) {
          const validationMessage = propsRef.current.onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
            continue;
          }
        }

        if (acceptTypes) {
          const fileType = file.type;
          const fileExtension = `.${file.name.split(".").pop()}`;

          if (
            !acceptTypes.some(
              (type) =>
                type === fileType || type === fileExtension || (type.includes("/*") && fileType.startsWith(type.replace("/*", "/"))),
            )
          ) {
            rejectionMessage = "File type not accepted";
            propsRef.current.onFileReject?.(file, rejectionMessage);
            rejected = true;
            invalid = true;
          }
        }

        if (maxSize && file.size > maxSize) {
          rejectionMessage = "File too large";
          propsRef.current.onFileReject?.(file, rejectionMessage);
          rejected = true;
          invalid = true;
        }

        if (!rejected) {
          acceptedFiles.push(file);
        } else {
          rejectedFiles.push({ file, message: rejectionMessage });
        }
      }

      if (invalid) {
        store.dispatch({ type: "SET_INVALID", invalid });
        setTimeout(() => {
          store.dispatch({ type: "SET_INVALID", invalid: false });
        }, 2000);
      }

      if (acceptedFiles.length > 0) {
        store.dispatch({ type: "ADD_FILES", files: acceptedFiles });

        if (isControlled && propsRef.current.onValueChange) {
          const currentFiles = Array.from(store.getState().files.values()).map((f) => f.file);
          propsRef.current.onValueChange([...currentFiles]);
        }

        if (propsRef.current.onAccept) {
          propsRef.current.onAccept(acceptedFiles);
        }

        for (const file of acceptedFiles) {
          propsRef.current.onFileAccept?.(file);
        }

        if (propsRef.current.onUpload) {
          requestAnimationFrame(() => {
            onFilesUpload(acceptedFiles);
          });
        }
      }
    },
    [store, isControlled, propsRef, onFilesUpload, maxFiles, acceptTypes, maxSize, disabled],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      onFilesChange(files);
      event.target.value = "";
    },
    [onFilesChange],
  );

  const context = useMemo<FileUploadContextValueType>(
    () => ({
      dropzoneId,
      inputId,
      listId,
      labelId,
      dir,
      disabled,
      inputRef,
      urlCache,
    }),
    [dropzoneId, inputId, listId, labelId, dir, disabled, urlCache],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir,
        className: cn("relative flex flex-col gap-2", className),
        children: (
          <>
            {children}
            <input
              type="file"
              id={inputId}
              aria-labelledby={labelId}
              aria-describedby={dropzoneId}
              ref={inputRef}
              tabIndex={-1}
              accept={accept}
              name={name}
              className="sr-only"
              disabled={disabled}
              multiple={multiple}
              required={required}
              onChange={onInputChange}
            />
            <div id={labelId} className="sr-only">
              {label ?? "File upload"}
            </div>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload",
      disabled: disabled ? "" : undefined,
    },
  });

  return (
    <StoreContext value={store}>
      <FileUploadContext value={context}>{element}</FileUploadContext>
    </StoreContext>
  );
}

type FileUploadDropzoneType = ComponentProps<"div"> & useRender.ComponentProps<"div">;

function FileUploadDropzone({
  render,
  className,
  onClick: onClickProp,
  onDragOver: onDragOverProp,
  onDragEnter: onDragEnterProp,
  onDragLeave: onDragLeaveProp,
  onDrop: onDropProp,
  onPaste: onPasteProp,
  onKeyDown: onKeyDownProp,
  ...props
}: FileUploadDropzoneType) {
  const context = useFileUploadContext("FileUploadDropzone");
  const store = useStoreContext("FileUploadDropzone");
  const dragOver = useStore((state) => state.dragOver);
  const invalid = useStore((state) => state.invalid);

  const propsRef = useAsRef({
    onClick: onClickProp,
    onDragOver: onDragOverProp,
    onDragEnter: onDragEnterProp,
    onDragLeave: onDragLeaveProp,
    onDrop: onDropProp,
    onPaste: onPasteProp,
    onKeyDown: onKeyDownProp,
  });

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      propsRef.current.onClick?.(event);

      if (event.defaultPrevented) return;

      const target = event.target;

      const isFromTrigger = target instanceof HTMLElement && target.closest('[data-slot="file-upload-trigger"]');

      if (!isFromTrigger) {
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragOver?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
    },
    [store, propsRef],
  );

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragEnter?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: true });
    },
    [store, propsRef],
  );

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      propsRef.current.onDragLeave?.(event);

      if (event.defaultPrevented) return;

      const relatedTarget = event.relatedTarget;
      if (relatedTarget && relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)) {
        return;
      }

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });
    },
    [store, propsRef],
  );

  // TODO
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      propsRef.current.onDrop?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });
      const files = Array.from(event.dataTransfer.files);
      const inputRef = context.inputRef;
      queueMicrotask(() => {
        const inputElement = inputRef.current;
        if (!inputElement) return;
        const dataTransfer = new DataTransfer();
        for (const file of files) dataTransfer.items.add(file);
        inputElement.files = dataTransfer.files;
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
      });
    },
    [store, context.inputRef, propsRef],
  );

  const onPaste = useCallback(
    // eslint-disable-next-line react-hooks/immutability
    (event: ClipboardEvent<HTMLDivElement>) => {
      propsRef.current.onPaste?.(event);

      if (event.defaultPrevented) return;

      event.preventDefault();
      store.dispatch({ type: "SET_DRAG_OVER", dragOver: false });

      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length === 0) return;

      const inputElement = context.inputRef.current;
      if (!inputElement) return;

      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }

      // eslint-disable-next-line react-hooks/immutability
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    },
    [store, context.inputRef, propsRef],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      propsRef.current.onKeyDown?.(event);

      if (!event.defaultPrevented && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        context.inputRef.current?.click();
      }
    },
    [context.inputRef, propsRef],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      // eslint-disable-next-line react-hooks/refs
      {
        "role": "region",
        "id": context.dropzoneId,
        "aria-controls": `${context.inputId} ${context.listId}`,
        "aria-disabled": context.disabled,
        "aria-invalid": invalid,
        "dir": context.dir,
        "tabIndex": context.disabled ? undefined : 0,
        "className": cn(
          "relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-disabled:pointer-events-none data-dragging:border-primary/30 data-invalid:border-destructive data-dragging:bg-accent/30 data-invalid:ring-destructive/20",
          className,
        ),
        onClick,
        onDragEnter,
        onDragLeave,
        onDragOver,
        onDrop,
        onKeyDown,
        onPaste,
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-dropzone",
      disabled: context.disabled ? "" : undefined,
      dragging: dragOver ? "" : undefined,
      invalid: invalid ? "" : undefined,
    },
  });

  return element;
}

type FileUploadTriggerType = ComponentProps<"button"> & useRender.ComponentProps<"button">;

function FileUploadTrigger({
  render = <Button variant="link" size="sm" />,
  onClick: onClickProp,
  className,
  ...props
}: FileUploadTriggerType) {
  const context = useFileUploadContext("FileUploadTrigger");

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);

      if (event.defaultPrevented) return;

      context.inputRef.current?.click();
    },
    [context.inputRef, propsRef],
  );

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      // eslint-disable-next-line react-hooks/refs
      {
        "type": "button",
        "className": cn("p-0", className),
        "aria-controls": context.inputId,
        "disabled": context.disabled,
        onClick,
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-trigger",
      disabled: context.disabled ? "" : undefined,
    },
  });

  return element;
}

type FileUploadListType = {
  orientation?: OrientationType;
  forceMount?: boolean;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

function FileUploadList({ className, orientation = "vertical", render, forceMount, ...props }: FileUploadListType) {
  const context = useFileUploadContext("FileUploadList");
  const fileCount = useStore((state) => state.files.size);
  const shouldRender = forceMount || fileCount > 0;

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "list",
        "id": context.listId,
        "aria-orientation": orientation,
        "dir": context.dir,
        "className": cn(
          "data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0 data-[state=inactive]:slide-out-to-top-2 data-[state=active]:slide-in-from-top-2 flex flex-col gap-2 data-[state=active]:animate-in data-[state=inactive]:animate-out",
          orientation === "horizontal" && "flex-row overflow-x-auto p-1.5",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-list",
      orientation,
      state: shouldRender ? "active" : "inactive",
    },
  });

  if (!shouldRender) return null;

  return element;
}

type FileUploadItemContextValueType = {
  id: string;
  fileState: FileStateType | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
};

const FileUploadItemContext = createContext<FileUploadItemContextValueType | null>(null);

function useFileUploadItemContext(consumerName: string) {
  const context = useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

type FileUploadItemType = { value: File } & ComponentProps<"div"> & useRender.ComponentProps<"div">;

function FileUploadItem({ value, render, className, ...props }: FileUploadItemType) {
  const id = useId();
  const statusId = `${id}-status`;
  const nameId = `${id}-name`;
  const sizeId = `${id}-size`;
  const messageId = `${id}-message`;

  const context = useFileUploadContext(ITEM_NAME);
  const fileState = useStore((state) => state.files.get(value));
  const fileCount = useStore((state) => state.files.size);
  const fileIndex = useStore((state) => {
    const files = Array.from(state.files.keys());
    return files.indexOf(value) + 1;
  });

  const itemContext = useMemo(
    () => ({
      id,
      fileState,
      nameId,
      sizeId,
      statusId,
      messageId,
    }),
    [id, fileState, statusId, nameId, sizeId, messageId],
  );

  const statusText = fileState?.error
    ? `Error: ${fileState.error}`
    : fileState?.status === "uploading"
      ? `Uploading: ${fileState.progress}% complete`
      : fileState?.status === "success"
        ? "Upload complete"
        : "Ready to upload";

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "role": "listitem",
        id,
        "aria-setsize": fileCount,
        "aria-posinset": fileIndex,
        "aria-describedby": `${nameId} ${sizeId} ${statusId} ${fileState?.error ? messageId : ""}`,
        "aria-labelledby": nameId,
        "dir": context.dir,
        "className": cn("relative flex items-center gap-2.5 rounded-md border p-3", className),
        "children": (
          <>
            {props.children}
            <span id={statusId} className="sr-only">
              {statusText}
            </span>
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-item",
    },
  });

  if (!fileState) return null;

  return <FileUploadItemContext value={itemContext}>{element}</FileUploadItemContext>;
}

type FileUploadItemPreviewType = {
  previewRender?: (file: File, fallback: () => ReactNode) => ReactNode;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

function FileUploadItemPreview({ previewRender, render, children, className, ...props }: FileUploadItemPreviewType) {
  const itemContext = useFileUploadItemContext("FileUploadItemPreview");
  const context = useFileUploadContext("FileUploadItemPreview");

  const getDefaultRender = useCallback(
    (file: File) => {
      if (itemContext.fileState?.file.type.startsWith("image/")) {
        let url = context.urlCache.get(file);
        if (!url) {
          url = URL.createObjectURL(file);
          context.urlCache.set(file, url);
        }

        return (
          // biome-ignore lint/performance/noImgElement: dynamic file URLs from user uploads don't work well with Next.js Image optimization
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} className="size-full object-cover" />
        );
      }

      return getFileIcon(file);
    },
    [itemContext.fileState?.file.type, context.urlCache],
  );

  const onPreviewRender = useCallback(
    (file: File) => {
      if (previewRender) {
        return previewRender(file, () => getDefaultRender(file));
      }

      return getDefaultRender(file);
    },
    [previewRender, getDefaultRender],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        "aria-labelledby": itemContext.nameId,
        "className": cn(
          "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-accent/50 [&>svg]:size-10",
          className,
        ),
        "children": itemContext.fileState ? (
          <>
            {onPreviewRender(itemContext.fileState.file)}
            {children}
          </>
        ) : null,
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-preview",
    },
  });

  if (!itemContext.fileState) return null;

  return element;
}

type FileUploadItemMetadataType = {
  size?: "default" | "sm";
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

function FileUploadItemMetadata({ render, size = "default", children, className, ...props }: FileUploadItemMetadataType) {
  const context = useFileUploadContext("FileUploadItemMetadata");
  const itemContext = useFileUploadItemContext("FileUploadItemMetadata");

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir: context.dir,
        className: cn("flex min-w-0 flex-1 flex-col", className),
        children: children ?? (
          <>
            <span
              id={itemContext.nameId}
              className={cn("truncate font-medium text-sm", size === "sm" && "font-normal text-[13px] leading-snug")}
            >
              {itemContext.fileState?.file.name}
            </span>
            <span
              id={itemContext.sizeId}
              className={cn("truncate text-muted-foreground text-xs", size === "sm" && "text-[11px] leading-snug")}
            >
              {itemContext.fileState ? formatBytes(itemContext.fileState.file.size) : ""}
            </span>
            {itemContext.fileState?.error && (
              <span id={itemContext.messageId} className="text-destructive text-xs">
                {itemContext.fileState.error}
              </span>
            )}
          </>
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-metadata",
    },
  });

  if (!itemContext.fileState) return null;

  return element;
}

type FileUploadItemProgressType = {
  variant?: "linear" | "circular" | "fill";
  size?: number;
  forceMount?: boolean;
} & ComponentProps<"div"> &
  useRender.ComponentProps<"div">;

function FileUploadItemProgress({ variant = "linear", size = 40, render, forceMount, className, ...props }: FileUploadItemProgressType) {
  const itemContext = useFileUploadItemContext("FileUploadItemProgress");

  const shouldRender = forceMount || (itemContext.fileState?.progress !== 100 && itemContext.fileState?.progress !== undefined);

  let elementProps: React.ComponentProps<"div"> & {
    children?: React.ReactNode;
  };

  if (variant === "circular") {
    const circumference = 2 * Math.PI * ((size - 4) / 2);
    const strokeDashoffset = itemContext.fileState ? circumference - (itemContext.fileState.progress / 100) * circumference : circumference;

    elementProps = {
      "role": "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": itemContext.fileState?.progress ?? 0,
      "aria-valuetext": `${itemContext.fileState?.progress ?? 0}%`,
      "aria-labelledby": itemContext.nameId,
      "className": cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", className),
      "children": (
        <svg className="-rotate-90 transform" width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" stroke="currentColor">
          <circle className="text-primary/20" strokeWidth="2" cx={size / 2} cy={size / 2} r={(size - 4) / 2} />
          <circle
            className="text-primary transition-[stroke-dashoffset] duration-300 ease-linear"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            cx={size / 2}
            cy={size / 2}
            r={(size - 4) / 2}
          />
        </svg>
      ),
    };
  } else if (variant === "fill") {
    const progressPercentage = itemContext.fileState?.progress ?? 0;
    const topInset = 100 - progressPercentage;

    elementProps = {
      "role": "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": progressPercentage,
      "aria-valuetext": `${progressPercentage}%`,
      "aria-labelledby": itemContext.nameId,
      "className": cn("absolute inset-0 bg-primary/50 transition-[clip-path] duration-300 ease-linear", className),
      "style": {
        clipPath: `inset(${topInset}% 0% 0% 0%)`,
      },
    };
  } else {
    elementProps = {
      "role": "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": itemContext.fileState?.progress ?? 0,
      "aria-valuetext": `${itemContext.fileState?.progress ?? 0}%`,
      "aria-labelledby": itemContext.nameId,
      "className": cn("relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20", className),
      "children": (
        <div
          className="h-full w-full flex-1 bg-primary transition-transform duration-300 ease-linear"
          style={{
            transform: `translateX(-${100 - (itemContext.fileState?.progress ?? 0)}%)`,
          }}
        />
      ),
    };
  }

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(elementProps, props),
    render,
    state: {
      slot: "file-upload-progress",
      variant,
    },
  });

  if (!itemContext.fileState || !shouldRender) return null;

  return element;
}

type FileUploadItemDeleteType = ComponentProps<"button"> & useRender.ComponentProps<"button">;

function FileUploadItemDelete({
  render = <Button variant="ghost" size="icon" />,
  onClick: onClickProp,
  className,
  ...props
}: FileUploadItemDeleteType) {
  const store = useStoreContext("FileUploadItemDelete");
  const itemContext = useFileUploadItemContext("FileUploadItemDelete");

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (!itemContext.fileState || event.defaultPrevented) return;

      store.dispatch({
        type: "REMOVE_FILE",
        file: itemContext.fileState.file,
      });
    },
    [store, itemContext.fileState, onClickProp],
  );

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        "type": "button",
        "className": cn("size-7", className),
        "aria-controls": itemContext.id,
        "aria-describedby": itemContext.nameId,
        onClick,
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-item-delete",
    },
  });

  if (!itemContext.fileState) return null;

  return element;
}

type FileUploadClearType = {
  forceMount?: boolean;
} & ComponentProps<"button"> &
  useRender.ComponentProps<"button">;

function FileUploadClear({
  render = <Button variant="outline" size="icon" />,
  forceMount,
  disabled,
  onClick: onClickProp,
  className,
  ...props
}: FileUploadClearType) {
  const context = useFileUploadContext("FileUploadClear");
  const store = useStoreContext("FileUploadClear");
  const fileCount = useStore((state) => state.files.size);

  const isDisabled = disabled || context.disabled;

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event);

      if (event.defaultPrevented) return;

      store.dispatch({ type: "CLEAR" });
    },
    [store, onClickProp],
  );

  const shouldRender = forceMount || fileCount > 0;

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        "type": "button",
        "aria-controls": context.listId,
        "disabled": isDisabled,
        "className": cn("size-7", className),
        onClick,
      },
      props,
    ),
    render,
    state: {
      slot: "file-upload-clear",
      disabled: isDisabled ? "" : undefined,
    },
  });

  if (!shouldRender) return null;

  return element;
}

export {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
  useStore as useFileUpload,
  type FileUploadType,
};
