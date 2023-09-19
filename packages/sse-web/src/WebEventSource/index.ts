import { IEventSource } from '@wrtn-test/sse-types';
import { fetchEventSource as MSEventSource } from '@microsoft/fetch-event-source';

class WebEventSource extends IEventSource {
  private controller: AbortController = new AbortController();

  public async open(): Promise<void> {
    this.controller = new AbortController();

    await MSEventSource(this.url, {
      openWhenHidden: true,
      onmessage: (event) => {
        if (event.id) {
          this.lastEventId = event.id;
        }

        this.listeners.message.forEach((listener) => {
          listener({
            type: 'message',
            data: event.data,
            lastEventId: event.id,
            event: event.event,
          });
        });
      },
      onclose: () => {
        this.listeners.close.forEach((listener) => {
          listener({ type: 'close' });
        });
      },
      onerror: (error: unknown) => {
        this.listeners.error.forEach((listener) => {
          listener({
            type: 'error',
            data: error,
            message: undefined,
            statusCode: undefined,
          });
        });
      },
      onopen: async (response) => {
        if (response.status >= 400) {
          response
            .json()
            .then((data) => {
              this.listeners.error.forEach((listener) => {
                listener({
                  type: 'error',
                  data,
                  message: response.statusText,
                  statusCode: response.status,
                });
              });

              this.controller?.abort();
            })
            .catch(() => {
              this.controller?.abort();
            });
        } else {
          this.listeners.open.forEach((listener) => {
            listener({ type: 'open' });
          });
        }
      },
      headers: this.config.headers,
      body: JSON.stringify(this.config.body),
      method: this.config.method,
      signal: this.controller.signal,
    });
  }

  public close(): void {
    this.removeEventListeners();
    this.controller.abort();
  }

  public abort(): void {
    this.controller.abort();
  }

  public retry(): void {
    this.config.headers = this.config.headers || {};

    if (this.lastEventId) {
      Object.assign(this.config.headers, {
        'Last-Event-ID': this.lastEventId,
      });
    }

    this.open();
  }

  public removeEventListeners(): void {
    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: [],
      timeout: [],
    };
  }
}

export default WebEventSource;
