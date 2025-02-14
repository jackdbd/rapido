# @jackdbd/microformats2

[![npm version](https://badge.fury.io/js/@jackdbd%2Fmicroformats2.svg)](https://badge.fury.io/js/@jackdbd%2Fmicroformats2)
[![install size](https://packagephobia.com/badge?p=@jackdbd/microformats2)](https://packagephobia.com/result?p=@jackdbd/microformats2)
[![CodeCov badge](https://codecov.io/gh/jackdbd/rapido/graph/badge.svg?token=BpFF8tmBYS)](https://app.codecov.io/gh/jackdbd/rapido?flags%5B0%5D=microformats2)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/microformats2)](https://socket.dev/npm/package/@jackdbd/microformats2)

Schemas for [microformats2](https://microformats.org/wiki/microformats2) and [jf2](https://microformats.org/wiki/jf2).

- [Installation](#installation)
- [Examples](#examples)
  - [microformats2 h\-adr](#microformats2-h-adr)
  - [microformats2 h\-entry](#microformats2-h-entry)
  - [microformats2 h\-event](#microformats2-h-event)
- [Docs](#docs)
- [Dependencies](#dependencies)
- [References](#references)
- [License](#license)

## Installation

```sh
npm install @jackdbd/microformats2
```

## Examples

### microformats2 h\-adr

h-adr is a simple, open format for publishing structured locations such as addresses, physical and/or postal.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**altitude**|`number`|Distance in metres from the nominal sea level along the tangent of the earth’s curve, i.e. the geoid height.<br/>||
|**country\-name**|`string`|||
|**extended\-address**|`string`|||
|**geo**||||
|**label**|`string`|||
|**latitude**|`number`|Coordinate that specifies the north–south position of a point on the surface of the Earth, in decimal degrees.<br/>Minimum: `-90`<br/>Maximum: `90`<br/>||
|**locality**|`string`|||
|**longitude**|`number`|Coordinate that specifies the east–west position of a point on the surface of the Earth, in decimal degrees.<br/>Minimum: `-180`<br/>Maximum: `180`<br/>||
|**post\-office\-box**|`string`|||
|**postal\-code**|`string`|||
|**region**|`string`|||
|**street\-address**|`string`|||

**Example**

```json
{
    "altitude": 43,
    "country-name": "Iceland",
    "latitude": 64.128288,
    "locality": "Reykjavík",
    "longitude": -21.827774,
    "postal-code": "107",
    "street-address": "17 Austerstræti"
}
```

**Example**

```json
{
    "geo": {
        "latitude": 64.128288,
        "locality": "Reykjavík",
        "longitude": -21.827774
    }
}
```

**Example**

```json
{
    "geo": "geo:37.786971,-122.399677;u=35"
}
```

### microformats2 h\-entry

h-entry is the microformats2 vocabulary for marking up blog posts on web sites. It can also be used to mark-up any other episodic or time series based content.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**author**||||
|**bookmark\-of**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>||
|**category**||category/categories<br/>||
|**content**||||
|**in\-reply\-to**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>||
|**like\-of**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>||
|**location**||Location of the entry.<br/>||
|**name**<br/>(Name of the entry, event, item, product, etc\.)|`string`|Name to use in h-entry, h-event, h-item, h-product, h-recipe, h-review, h-review-aggregate.<br/>Minimal Length: `1`<br/>||
|**published**<br/>(Published at)||Date or date-time of when something was published or will be published (e.g. h-entry, h-recipe)<br/>||
|**read\-of**||||
|**repost\-of**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>||
|**rsvp**||An RSVP is a reply to an event that says whether the sender is attending, is not attending, might attend, or is merely interested.<br/>||
|**summary**|`string`|Summary to use in h-entry, h-recipe, h-resume.<br/>Minimal Length: `1`<br/>||
|**syndication**||URL(s) of syndicated copies of this post. The property equivalent of rel-syndication.<br/>||
|**type**|`string`|Default: `"entry"`<br/>Constant Value: `"entry"`<br/>||
|**updated**<br/>(Updated at)||Date or date-time of when something was updated or will be updated (e.g. h-entry)<br/>||
|**uri**<br/>(UID)|`string`|URL/URI that uniquely/canonically identifies the object)<br/>Format: `"uri"`<br/>||
|**url**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>||

**Example**

```json
{
    "content": "A plain text note"
}
```

**Example**

```json
{
    "content": {
        "text": "this is a note",
        "html": "<p>This <b>is</b> a note</p>"
    },
    "published": "2024-11-12T23:20:50.52Z",
    "updated": "2024-11-29T23:20:50.52Z"
}
```

**Example**

```json
{
    "bookmark-of": "https://mxb.dev/blog/make-free-stuff/",
    "content": "Nice article!"
}
```

**Example**

```json
{
    "like-of": "http://othersite.example.com/permalink47"
}
```

**Example**

```json
{
    "repost-of": "https://example.com/post",
    "content": {
        "html": "<p>You should read this <strong>awesome</strong> article</p>"
    }
}
```

**Example**

```json
{
    "in-reply-to": "https://aaronparecki.com/2014/09/13/7/indieweb-xoxo-breakfast",
    "rsvp": "maybe"
}
```

### microformats2 h\-event

h-event is the microformats2 vocabulary for marking up an event post on web sites. h-event is often used with both event listings and individual event pages.

**Properties**

|Name|Type|Description|Required|
|----|----|-----------|--------|
|**category**||category/categories<br/>|no|
|**content**|||no|
|**description**|`string`|The description (use in h-event, h-product)<br/>Minimal Length: `1`<br/>|no|
|**duration**|`string`|Duration formatted according to RFC3339<br/>Format: `"duration"`<br/>|no|
|**end**<br/>(End at)||Date or date-time when something ends (e.g. an h-event)<br/>|no|
|**location**||Location of the event.<br/>|no|
|**name**<br/>(Name of the entry, event, item, product, etc\.)|`string`|Name to use in h-entry, h-event, h-item, h-product, h-recipe, h-review, h-review-aggregate.<br/>Minimal Length: `1`<br/>|no|
|**start**<br/>(Start at)||Date or date-time when something starts (e.g. an h-event)<br/>|no|
|**summary**|`string`|Summary to use in h-entry, h-recipe, h-resume.<br/>Minimal Length: `1`<br/>|no|
|**type**|`string`|Constant Value: `"event"`<br/>|yes|
|**url**<br/>(URL of the card, entry, event, etc\.)|`string`|URL to use in h-card, h-entry, h-event, etc.<br/>Format: `"uri"`<br/>|no|

**Example**

```json
{
    "name": "Microformats Meetup",
    "start": "2013-06-30 12:00:00-07:00",
    "end": "2013-06-30 18:00:00-07:00",
    "location": "Some bar in SF",
    "summary": "Get together and discuss all things microformats-related."
}
```

## Docs

[Docs generated by TypeDoc](https://jackdbd.github.io/rapido/microformats2/0.2.0-canary.8)

## Dependencies

| Package | Version |
|---|---|
| [@sinclair/typebox](https://www.npmjs.com/package/@sinclair/typebox) | `^0.34.14` |

## References

- [Microformats](https://developer.mozilla.org/en-US/docs/Web/HTML/microformats)
- [microformats wiki](https://microformats.org/wiki/Main_Page)
- [jf2](https://microformats.org/wiki/jf2)
- [JF2 Post Serialization Format](https://jf2.spec.indieweb.org/)

## License

&copy; 2024 - 2025 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
