export class CustomEventTarget {
  private _evt = new EventTarget();

  public dispatchEvent<K>(type: string, detail?: K) {
    return this._evt.dispatchEvent(new CustomEvent<K>(type, { detail }));
  }

  public addEventListener<K>(
    type: string,
    callback: (event: CustomEvent<K>) => void,
  ) {
    this._evt.addEventListener(type, callback as EventListener);
  }

  public removeEventListener<K>(
    type: string,
    callback: (event: CustomEvent<K>) => void,
  ) {
    this._evt.removeEventListener(type, callback as EventListener);
  }
}
