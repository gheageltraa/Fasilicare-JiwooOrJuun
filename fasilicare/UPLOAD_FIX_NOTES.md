# Evidence-photo upload fix

The failing upload flow was traced to Cloudinary returning `Upload preset not found` for the configured `fasilicare_preset` on the configured cloud. The correct Cloudinary cloud name and unsigned preset were requested through project secrets and validated with a live POST probe that rejects the missing-preset condition.

The browser upload component now reads both `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`, validates image type and a 10 MB size limit, disables duplicate selection while uploading, surfaces the Cloudinary error message, and is shared by report evidence and technician live-proof uploads.

Verification completed: transformed browser source includes the preset variable and Cloudinary endpoint; `pnpm check`, the full Vitest suite (4 files, 4 tests), and `pnpm build` all pass.

## End-to-end confirmation

The browser-transformed module contains `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`. A real browser POST to the same unsigned endpoint with a 1-pixel PNG returned HTTP 200 and a Cloudinary `secure_url`, confirming the repaired configuration and CORS-capable endpoint. The same helper is used by both the reporter evidence and technician live-proof controls.
