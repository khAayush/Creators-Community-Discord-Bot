# Creators Community Discord Bot

A multipurpose community management bot for the Creators Community Discord server.

---

## Features

- [Welcome Message](#-welcome-message) — greets new members automatically
- [Reaction Roles](#-reaction-roles) — let members self-assign roles with emoji reactions
- [Announcements](#-announcements) — post formatted announcements with a slash command

---

## 👋 Welcome Message

**Who it affects:** Everyone who joins the server.  
**No action needed** — this is fully automatic.

When a new member joins, the bot sends a welcome message in the welcome channel that:

- Mentions the new member by name
- Includes the server name
- Shows their member number

**Example:**

> **Welcome to Creators Community! 🎉**
> Hey @Aayush, we're glad you're here!
> Please read the rules and enjoy your stay.
> *Member #42*

---

## 🎭 Reaction Roles

**Who can use it:** Everyone.  
**Where:** In the channel where the role selection message is posted.

Members can pick up roles by reacting to the role selection message with the matching emoji.

### How to get a role

1. Find the **Role Selection** message in the roles channel
2. Click the emoji next to the role you want:

   | Emoji | Role |
   |-------|------|
   | 🎮 | Gamer |
   | 💻 | Developer |
   | 📢 | Announcements |

3. The bot instantly adds the role to your profile — no waiting

### How to remove a role

Click the same emoji again to remove your reaction. The bot will remove the role from your profile.

> **Note:** You can pick up as many roles as you like.

---

### For admins — posting the role selection message

If the role selection message is missing, an admin can recreate it:

1. Go to the channel where you want the message to appear
2. Type `/setup-reaction-roles` and press Enter
3. The bot posts the embed and adds all the reactions automatically

> Requires **Manage Server** permission.

---

## 📢 Announcements

**Who can use it:** Admins and members with **Manage Server** permission.  
**Where:** Any channel (the announcement is posted to the configured announcements channel).

### How to post an announcement

1. Type `/announce` anywhere in the server
2. Fill in the two fields that appear:
   - **title** — a short heading for the announcement
   - **message** — the full announcement text
3. Press Enter — the bot posts a formatted embed in the announcements channel
4. Only you can see the confirmation message ("Announcement posted!")

**Example result in the announcements channel:**

> 📢 **Community Game Night**
> Join us this Saturday at 8 PM for a community game night! All are welcome.
> *— posted by Aayush · today at 6:30 PM*

> **Note:** The `/announce` command is only visible to members who have permission to use it. Regular members will not see it.

---

## Permissions Quick Reference

| Feature | Who triggers it | Permission needed |
|---|---|---|
| Welcome message | Automatic on join | — |
| Pick up a role | Any member | None |
| Post the role selection message | Admin | Manage Server |
| Post an announcement | Admin | Manage Server |

---

## Having issues?

If the bot is not responding or a feature seems broken, contact a server admin or open an issue on [GitHub](https://github.com/khAayush/Creators-Community-Discord-Bot/issues).
