# 0008. Publish Releases From CI Before Matrix Uploads

- Status: accepted
- Date: 2026-08-04

## Context

The previous release flow asked two parallel platform jobs to upload to a draft
GitHub Release, then depended on a local process to turn that draft into the
latest release. A transient GitHub API failure in the local watcher could leave
successful installers without a published release.

## Decision

The release workflow creates or promotes the tag's GitHub Release in a single
preparation job. The macOS and Windows matrix jobs depend on that job and upload
directly to the already-published release. `electron-builder` uses
`releaseType: release`, and the local release script only waits for CI and
validates the remote release.

## Consequences

The public release exists before platform uploads begin, so auto-update metadata
has a stable destination and local network failures cannot block the final
publication step. Re-running the workflow is safe: the preparation job reuses
an existing release and the platform jobs upload to it. Manual reruns must pass
the tag input so the workflow checks out the intended release commit.
