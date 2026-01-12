## Groups Plan

Groups allow users to create groups (workos orgs) that can include other users. 

These groups give users access to a group API key that can be used for inference.

- Users can only belong to one group
- Users can leave a group at any time (they will need their own key then)

## Group settings

- canViewMembersChats - boolean - if true group owners can view chats created by group members (we will let the user know before joining the group)
- allowPublicChats - boolean - if true group members can share their chats with members outside of the organization


## User experience

Users will get an email invitation from the group owner to join the group. If they aren't signed up this will take them to sign up. Once they are signed up choosing a group to join will be part of the onboarding process. (If there are no group invites they will just see the api token modal)