/**
 * UI ownership cut-over for the live 0.1.70.4.x board.
 *
 * Historical scene wrappers remain in the inheritance chain because they also
 * retain gameplay/network fixes. Presentation hotfix writers must not keep
 * mutating the final UI after the canonical owner has been installed.
 */
export interface CanonicalUiOwner071Runtime {
  canonicalUiOwner071?: boolean;
}

export function isCanonicalUiOwner071(scene: unknown): boolean {
  return Boolean((scene as CanonicalUiOwner071Runtime | undefined)?.canonicalUiOwner071);
}
