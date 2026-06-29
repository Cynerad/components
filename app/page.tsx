"use client";

import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
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
} from "@/playground/mine/file-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  image: z.array(z.file().mime("image/gif")).max(2, "Please select up to 2 files"),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: [],
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data.image);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Done!");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Container>
        <FieldGroup>
          <Controller
            name="image"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Upload Files</FieldLabel>

                <FileUpload
                  value={field.value}
                  onValueChange={field.onChange}
                  multiple
                  onUpload={async (files, { onProgress, onSuccess, onError }) => {
                    // Simulates upload with progress for each file
                    for (const file of files) {
                      try {
                        for (let p = 0; p <= 100; p += 20) {
                          await new Promise((r) => setTimeout(r, 200));
                          onProgress(file, p);
                        }
                        onSuccess(file);
                      } catch (err) {
                        onError(file, err instanceof Error ? err : new Error("Upload failed"));
                      }
                    }
                  }}
                >
                  {/* Dropzone */}
                  <FileUploadDropzone className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 px-20 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-disabled:pointer-events-none data-dragging:border-primary/30 data-dragging:bg-accent/30 data-invalid:border-destructive">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">Drag & drop files here</p>
                      <p className="text-muted-foreground text-xs">Or click to browse (max 4 files)</p>
                    </div>
                  </FileUploadDropzone>

                  {/* Trigger button — opens file picker without clicking the dropzone */}
                  <FileUploadTrigger render={<Button variant="outline" />}>Browse files</FileUploadTrigger>

                  {/* File list */}
                  <FileUploadList>
                    {field.value.map((file, index) => (
                      <FileUploadItem key={`${index}-${file.name}-${file.size}`} value={file}>
                        {/* Preview: image thumbnail or file type icon */}
                        <FileUploadItemPreview />

                        {/* Filename + size + error message */}
                        <FileUploadItemMetadata />

                        {/* Progress bar — hides automatically at 100% */}
                        <FileUploadItemProgress variant="circular" />

                        {/* Remove single file */}
                        <FileUploadItemDelete
                          render={
                            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground hover:text-destructive" />
                          }
                        >
                          <Trash2 className="size-4" />
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>

                  {/* Clear all files at once */}
                  <FileUploadClear render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}>
                    Clear all
                  </FileUploadClear>
                </FileUpload>

                {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Uploading..." : "Submit"}
        </Button>
      </Container>
    </form>
  );
}

// <div className="relative flex select-none flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 px-20 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-disabled:pointer-events-none data-dragging:border-primary/30 data-invalid:border-destructive data-dragging:bg-accent/30 data-invalid:ring-destructive/20">
//   {children}
// </div>
