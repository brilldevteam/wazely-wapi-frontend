# Changelog

## Wazely CRM rollout updates - 2026-11-26

### Agent shifts and automatic chat assignment
- Improve the All day control so users can return directly to custom working hours on desktop and narrow mobile screens.
- Change the remaining automatic-assignment guidance to use "Assign Available Agent" consistently instead of describing the selection as random.
- Add an Agent Shifts page (Team Management → Shifts) to create, edit and delete shifts with any IANA timezone, working days, multiple time ranges, overnight ranges and an "All day" option (with "Set hours" to switch back). Deleting uses the standard confirmation dialog and shows how many agents use the shift.
- Add a "Work schedule" (shift) selector to the agent form; inactive shifts are shown as "(inactive)" and explained as pausing automatic assignment.
- Add an Available / Away switch in the header, synced across tabs.
- Agents page: add Shift and Availability columns (Available, Away, Off shift, Offline with last seen) that update live.
- Predefined Actions: add an "Auto-assignment rules" card — chats always wait for an available agent, distribution method (Round-robin / Least open chats) and open chats per agent (No limit / Limit N).
- Chat list: show an amber "Waiting · 2h" label on chats waiting for an agent; agents get a "New chat assigned to you" alert (also right after login).
- Rename the automation step to "Assign Available Agent" and add an "Include business owner" switch (off by default).

### Fixes
- Fix logout freezing the page: logout now ends the server session, clears saved user data and loads the login page fresh; other open tabs log out too, and expired sessions go to the login page cleanly.
- Keep the live socket reconnecting after a server restart instead of giving up after 5 tries.
- Only mark Predefined Actions settings as saved when the save succeeds.
- Fix QR generate errors, let users see and rename the QR instance name, and stop agents getting alerts for chats that are not theirs.
- Require location name and address in the campaign wizard.
- Fix the login landing page and Contact Import Logs.

### Billing & Plans and Tasks
- Add Monthly / Yearly / One Time tabs to Billing & Plans (always visible when changing plan) and show plans as a feature comparison table.
- Use one readable "Most Popular" badge style on every plan colour and stop the plan slider looping.
- Redesign the Tasks page as three columns matching the WA Chat sidebar.

## WAPI v3.3 custom upgrade - 2026-10-03

- Upgrade the CRM frontend to the WAPI v3.3 vendor release (social media publishing, WhatsApp-formatted template bodies with rich preview, campaign batch stats, inquiry and settings updates).
- Keep all custom features: Wazely login logo, WhatsApp subscription request flow (the v3.3 Midtrans/Mollie checkout changes do not apply), searchable country code selects, +94 default contact code, campaign paused badge and "Completed with errors" label, and the custom favicon handling.
- Combine the Text Direction (RTL/LTR) control with the new WhatsApp formatting so direction and bold/italic/strikethrough both survive saving and reloading a template.

## WAPI v3.2 custom upgrade - 2026-07-16

- Upgrade the CRM frontend to the complete WAPI v3.2 vendor release.
- Add refreshed campaign, chat, Google Forms, ecommerce-product, Google Meet, chatbot-assignment, announcement, and integration interfaces.
- Preserve the searchable country-code selector, permission select-all, campaign failure presentation, media validation, carousel upload mapping, and dynamic favicon/base-path handling.
- Upgrade the application to Next.js 16.2 and regenerate the dependency lockfile.

## Unreleased

- Replace the customer subscription gateway checkout with a WhatsApp plan-request flow to +97460007544, allowing customers to send their receipt for super-admin verification and manual plan activation.
- Add a dedicated light-mode Wazely CRM logo for mobile login screens and match its visible size with the dark-mode logo across small viewports.
- Add reliable Location-header selection, a map-style preview, an interactive campaign location picker, and required coordinate validation.
- Prevent Location headers from silently reverting to Text when editing templates.
- Add a Text Direction (RTL/LTR) toolbar control to the Message Body editor, so Arabic/Hebrew and other right-to-left content can be set explicitly per paragraph and is preserved through plain-text delivery to WhatsApp via invisible Unicode direction marks, with the live preview matching the editor exactly.
- Fix the campaign status badge staying on "Sending" (with a spinning icon) after a campaign is paused, by showing a dedicated "Paused" state whenever a sending campaign has been paused.
- Fix Coupon Code marketing templates silently saving as Standard by requiring a valid Copy Code button before the template can be saved, instead of allowing it to save with no button or an invalid placeholder example.
- Use the searchable country-code dropdown (flag + dial code) for phone number fields in the WhatsApp Short Link form, the widget's WhatsApp number field, and the webhook merchant recipient numbers, matching Agent Management.
- Require the correct media attachment before submitting a WhatsApp media-template campaign.
- Keep explicit carousel card upload indexes and prevent unresolved browser blob URLs from being submitted.
- Show partially failed campaigns as "Completed with errors" instead of marking the entire campaign as failed.
