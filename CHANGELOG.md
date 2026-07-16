# Changelog

## WAPI v3.2 custom upgrade - 2026-07-16

- Upgrade the CRM frontend to the complete WAPI v3.2 vendor release.
- Add refreshed campaign, chat, Google Forms, ecommerce-product, Google Meet, chatbot-assignment, announcement, and integration interfaces.
- Preserve the searchable country-code selector, permission select-all, campaign failure presentation, media validation, carousel upload mapping, and dynamic favicon/base-path handling.
- Upgrade the application to Next.js 16.2 and regenerate the dependency lockfile.

## Unreleased

- Require the correct media attachment before submitting a WhatsApp media-template campaign.
- Keep explicit carousel card upload indexes and prevent unresolved browser blob URLs from being submitted.
- Show partially failed campaigns as "Completed with errors" instead of marking the entire campaign as failed.
