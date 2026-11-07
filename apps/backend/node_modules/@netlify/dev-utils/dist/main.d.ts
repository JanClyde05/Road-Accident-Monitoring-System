import { Context } from '@netlify/types';
import * as ansis from 'ansis';
import { ExecaChildProcess } from 'execa';
import { ServerResponse, IncomingMessage } from 'node:http';
import * as chokidar from 'chokidar';

type ReactiveSubscriber<T> = (newValue: T) => void;
/**
 * A reactive value holder. Wraps a value and notifies subscribers when it
 * changes. Consumers call {@link get} to read the current value and
 * {@link subscribe} to be notified of updates.
 */
declare class Reactive<T> {
    #private;
    constructor(initialValue: T);
    /**
     * Returns the current value.
     */
    get(): T;
    /**
     * Replaces the current value and notifies all subscribers.
     */
    set(newValue: T): void;
    /**
     * Registers a callback that will be called whenever the value changes.
     * Returns an unsubscribe function.
     */
    subscribe(callback: ReactiveSubscriber<T>): () => void;
}

declare const getAPIToken: () => Promise<string | undefined>;

declare const shouldBase64Encode: (contentType: string) => boolean;

declare const renderFunctionErrorPage: (errString: string, functionType: string) => Promise<string>;

interface DevEvent {
    name: string;
}
type DevEventHandler = (event: DevEvent) => void;

declare class LocalState {
    private path;
    constructor(cwd: string);
    get all(): any;
    set all(val: any);
    get size(): number;
    get(key: any): string | undefined;
    set(...args: any[]): void;
    has(key: any): boolean;
    delete(key: any): void;
    clear(): void;
}

type Geolocation = Context['geo'];
declare const mockLocation: Geolocation;
/**
 * Returns geolocation data from a remote API, the local cache, or a mock location, depending on the
 * specified options.
 */
declare const getGeoLocation: ({ enabled, cache, state, }: {
    enabled?: boolean;
    cache?: boolean;
    state: LocalState;
}) => Promise<Geolocation>;

type logFunction = (message?: string) => void;
type Logger = {
    error: logFunction;
    log: logFunction;
    warn: logFunction;
};
declare const netlifyCommand: ansis.Ansis;
declare const netlifyCyan: ansis.Ansis;
declare const netlifyBanner: string;
declare const warning: (message: string) => string;

declare const ensureNetlifyIgnore: (dir: string, logger?: Logger) => Promise<false | undefined>;

declare const headers: {
    BlobsInfo: string;
};
declare const toMultiValueHeaders: (headers: Headers) => Record<string, string[]>;

type ConfigStoreOptions<T extends Record<string, any>> = {
    defaults?: T | undefined;
};
declare class GlobalConfigStore<T extends Record<string, any> = Record<string, any>> {
    #private;
    constructor(options?: ConfigStoreOptions<T>);
    get all(): T;
    set(key: string, value: unknown): void;
    get(key: string): T[typeof key];
    private getConfig;
    private writeConfig;
}
declare const getGlobalConfigStore: () => Promise<GlobalConfigStore>;
declare const resetConfigCache: () => void;

type Handler = (request: Request) => Promise<Response>;

interface CacheEntry<T> {
    enqueued?: boolean;
    task: Promise<T>;
    timestamp: number;
}
type MemoizeCache<T> = Record<string, CacheEntry<T> | undefined>;
interface MemoizeOptions<T> {
    cache: MemoizeCache<T>;
    cacheKey: string;
    command: () => Promise<T>;
}
declare const memoize: <T>({ cache, cacheKey, command }: MemoizeOptions<T>) => Promise<T>;

interface ProcessRef {
    ps?: ExecaChildProcess;
}
declare const killProcess: (ps?: ExecaChildProcess) => Promise<void> | undefined;

/**
 * A Node.js HTTP server with support for middleware.
 */
declare class HTTPServer {
    private url?;
    private handler;
    private nodeServer?;
    constructor(handler: Handler);
    start(port?: number): Promise<string>;
    stop(): Promise<void>;
}

declare const toWebRequest: (nodeReq: IncomingMessage, urlPath?: string) => Request;
declare const fromWebResponse: (webRes: Response, res: ServerResponse) => Promise<void>;

type FileWatchCallback = (paths: string[]) => void;
interface FileWatchSubscriptionOptions {
    /**
     * An optional identifier for this subscription. When provided, calling
     * `subscribe` again with the same `id` is idempotent: if the paths haven't
     * changed, the existing handle is returned as-is. If the paths have changed,
     * the old subscription is automatically replaced.
     */
    id?: string;
    /**
     * One or more file or directory paths to watch.
     */
    paths: string | string[];
    /**
     * Called when a watched file's contents change.
     */
    onChange?: FileWatchCallback;
    /**
     * Called when a new file is created inside a watched directory.
     */
    onAdd?: FileWatchCallback;
    /**
     * Called when a watched file is deleted.
     */
    onUnlink?: FileWatchCallback;
    /**
     * Maximum directory depth to watch. For example, `depth: 1` only watches
     * files directly inside the watched directory, not in subdirectories.
     */
    depth?: number;
    /**
     * How long to wait (in milliseconds) before delivering a batch of events.
     * Defaults to 100ms.
     */
    debounceMs?: number;
    /**
     * Whether to clear the Node.js `require` cache for changed files before
     * delivering the event. Useful for hot-reloading CommonJS modules.
     */
    decache?: boolean;
}
interface FileWatchSubscriptionHandle {
    add(paths: string | string[]): void;
    unwatch(paths: string | string[]): void;
    unsubscribe(): void;
}
declare class FileWatcher {
    #private;
    constructor(options?: {
        ignored?: (string | RegExp)[];
    });
    subscribe(options: FileWatchSubscriptionOptions): FileWatchSubscriptionHandle;
    close(): Promise<void>;
}

interface WatchDebouncedOptions {
    depth?: number;
    ignored?: (string | RegExp)[];
    onAdd?: (paths: string[]) => void;
    onChange?: (paths: string[]) => void;
    onUnlink?: (paths: string[]) => void;
}
/**
 * Adds a file watcher to a path or set of paths and debounces the events.
 */
declare const watchDebounced: (target: string | string[], { depth, ignored, onAdd, onChange, onUnlink }: WatchDebouncedOptions) => Promise<chokidar.FSWatcher>;

export { type DevEvent, type DevEventHandler, type FileWatchSubscriptionHandle, type FileWatchSubscriptionOptions, FileWatcher, type Geolocation, GlobalConfigStore, HTTPServer, type Handler, LocalState, type Logger, type MemoizeCache, type ProcessRef, Reactive, ensureNetlifyIgnore, fromWebResponse, getAPIToken, getGeoLocation, getGlobalConfigStore, headers, killProcess, memoize, mockLocation, netlifyBanner, netlifyCommand, netlifyCyan, renderFunctionErrorPage, resetConfigCache, shouldBase64Encode, toMultiValueHeaders, toWebRequest, warning, watchDebounced };
