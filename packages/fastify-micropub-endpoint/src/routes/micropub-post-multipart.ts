import assert from "node:assert";
import { FastifyRequest } from "fastify";
import formAutoContent from "form-auto-content";
// import type { FormMethodResult } from "form-auto-content";
import { isAudio, isVideo } from "../mime-types.js";
import type { PostRequestBody } from "../schemas/index.js";

// Regarding formAutoContent of form-auto-content, I get "This expression is not
// callable" if I use this combination of module and moduleResolution in
// tsconfig:
// "module": "NodeNext"
// "moduleResolution": "nodenext"

interface Config {
  logPrefix: string;
  mediaEndpoint: string;
  micropubEndpoint: string;
}

type Value = number | string | any[];
type Data = Record<string, Value>;

interface UploadedMedia {
  // mimetype of a file uploaded to the Media endpoint.
  mimetype: string;
  // URL of a file uploaded to the Media endpoint.
  location: string;
}

export const areSameOrigin = (src: string, dest: string) => {
  return new URL(src).origin === new URL(dest).origin;
};

/**
 * Creates a function that parses a multipart request, collects all `field`
 * parts into a request body, and uploads all `file` parts to a media endpoint.
 *
 * IndiePass supports multi-photo, multi-audio, multi-video.
 *
 * Quill seems NOT to support multi-photo. I tried to create a multi-photo post
 * in Quill and it did upload both files to the media endpoint, but it didn't
 * even try to call my Micropub endpoint and failed with a runtime error.
 * @see https://github.com/aaronpk/Quill/blob/8ecaed3d2f5a19bf1a5c4cb077658e1bd3bc8438/lib/helpers.php#L402
 */
export const defMultipartRequestBody = (config: Config) => {
  const { logPrefix, mediaEndpoint, micropubEndpoint } = config;

  const multipartRequestBody = async (request: FastifyRequest) => {
    assert.ok(request.headers["content-type"]!.includes("multipart/form-data"));

    const data: Data = {};

    // A single multipart request to the Micropub endpoint can result in N
    // requests to the Media endpoint (e.g. a multi-photo post).
    // https://indieweb.org/multi-photo
    const uploaded: UploadedMedia[] = [];

    for await (const part of request.parts()) {
      if (part.type === "field") {
        const { fieldname, value } = part;

        if (fieldname.includes("[]")) {
          const k = fieldname.split("[]")[0];
          assert.ok(k, `fieldname ${fieldname} should not be empty`);

          if (data[k]) {
            assert.ok(Array.isArray(data[k]));
            request.log.debug(`${logPrefix}update ${k} array`);
            if (Array.isArray(value)) {
              data[k].push(...value);
            } else {
              data[k].push(value);
            }
          } else {
            request.log.debug(`${logPrefix}set ${k} array`);
            if (Array.isArray(value)) {
              data[k] = value;
            } else {
              data[k] = [value];
            }
          }
        } else {
          data[fieldname] = value as Value;
          request.log.debug(`${logPrefix}collected ${fieldname}=${value}`);
        }
      } else if (part.type === "file") {
        const { fieldname, file, filename, mimetype } = part;

        request.log.debug(
          `${logPrefix}received file ${filename} in field ${fieldname}. Uploading it to the media endpoint ${mediaEndpoint}`
        );

        // let response: LightMyRequestResponse | Response
        // See:
        // - networkless HTTP (https://www.youtube.com/watch?v=65WoHVTwbtI)
        // - https://github.com/mcollina/fastify-undici-dispatcher
        if (areSameOrigin(micropubEndpoint, mediaEndpoint)) {
          request.log.debug(
            `${logPrefix}make request to LOCAL media endpoint ${mediaEndpoint} (inject)`
          );

          // I find this quite clanky to use...
          const form = (formAutoContent as any)(
            {
              file: {
                value: file,
                options: {
                  filename,
                  contentType: mimetype,
                },
              },
            },
            { forceMultiPart: true }
          );

          // TODO: error handling.
          // What if the media endpoint returns a 4xx or 5xx status code?
          // Or, even worse, if it throws an exception?

          const response = await request.server.inject({
            url: mediaEndpoint,
            method: "POST",
            headers: {
              ...form.headers,
              authorization: request.headers.authorization,
            },
            payload: form.payload,
          });

          const location = response.headers.location;
          if (location) {
            uploaded.push({ location: location.toString(), mimetype });
          }
        } else {
          request.log.debug(
            `${logPrefix}make request to REMOTE media endpoint ${mediaEndpoint} (fetch)`
          );

          const form = (formAutoContent as any)(
            {
              file: {
                value: file,
                options: {
                  filename: filename,
                  contentType: mimetype,
                },
              },
            },
            { forceMultiPart: true }
          );

          // I am afraid this fetch is not correct
          const response = await fetch(mediaEndpoint, {
            method: "POST",
            headers: {
              ...form.headers,
              Authorization: request.headers.authorization!,
              // 'Content-Disposition': `form-data; name="${fieldname}"; filename="${filename}"`,
              // 'Content-Type': 'multipart/form-data'
            },
            body: await part.toBuffer(),
          });

          const location = response.headers.get("location") || undefined;
          if (location) {
            uploaded.push({ location, mimetype });
          }
        }

        if (uploaded.length > 0) {
          data["audio[]"] = [];
          data["video[]"] = [];
          // TODO: each photo might have an alternate text. I think it should be
          // in data['photo[][alt]']. I should try making requests from
          // different Micrpub clients (e.g. IndiePass, Quill).
          data["photo[]"] = [];
          // data['photo[]'] = [{ alt: '', value: '' }]
          for (const { location, mimetype } of uploaded) {
            if (isAudio(mimetype)) {
              data["audio[]"].push(location);
            } else if (isVideo(mimetype)) {
              data["video[]"].push(location);
            } else {
              data["photo[]"].push(location);
            }
          }
          request.log.info(
            {
              audio: data["audio[]"],
              photo: data["photo[]"],
              video: data["video[]"],
            },
            `${logPrefix}${uploaded.length} files uploaded to media endpoint`
          );
        }
      }
    }

    // Since we might have added audio[], video[], and photo[] fields, we need
    // to convert them into JS arrays. But since we have to do it anyway later
    // on in the POST /micropub handler, it's not necessary to do it here.
    // const jf2 = normalizeJf2(data)

    return data as PostRequestBody;
  };

  return multipartRequestBody;
};
