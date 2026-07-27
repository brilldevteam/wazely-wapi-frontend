# Changelog

## WAPI v3.2 custom upgrade - 2026-07-16

- Upgrade the CRM frontend to the complete WAPI v3.2 vendor release.
- Add refreshed campaign, chat, Google Forms, ecommerce-product, Google Meet, chatbot-assignment, announcement, and integration interfaces.
- Preserve the searchable country-code selector, permission select-all, campaign failure presentation, media validation, carousel upload mapping, and dynamic favicon/base-path handling.
- Upgrade the application to Next.js 16.2 and regenerate the dependency lockfile.

## Unreleased

- Add reliable Location-header selection, a map-style preview, an interactive campaign location picker, and required coordinate validation.
- Prevent Location headers from silently reverting to Text when editing templates.
- Fix Coupon Code marketing templates silently saving as Standard by requiring a valid Copy Code button before the template can be saved, instead of allowing it to save with no button or an invalid placeholder example.
- Warn upfront when editing a template that isn't Draft/Rejected, since WhatsApp rejects structural edits on Approved/Pending templates, and explain why Save is disabled when a button has invalid content.
- Use the searchable country-code dropdown (flag + dial code) for phone number fields in the WhatsApp Short Link form, the widget's WhatsApp number field, and the webhook merchant recipient numbers, matching Agent Management.
- Require the correct media attachment before submitting a WhatsApp media-template campaign.
- Keep explicit carousel card upload indexes and prevent unresolved browser blob URLs from being submitted.
- Show partially failed campaigns as "Completed with errors" instead of marking the entire campaign as failed.
