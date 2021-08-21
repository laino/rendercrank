
export abstract class Allocator<T> {
    private buffers: T[] = [];
    private sizes: number[] = [];

    protected abstract create(size: number): T;
    protected abstract discard(obj: T);
    public abstract sizeOf(obj: T): number;

    public allocate(amount: number) {
        const buffers = this.buffers;
        const sizes = this.sizes;

        while (buffers.length > 0) {
            const size = sizes.pop();
            const buffer = buffers.pop();

            if (amount <= size) {
                return buffer;
            } else {
                this.discard(buffer);
            }
        }

        return this.create(amount);
    }

    /*
     * It's recommended to return elements in reverse order.
     */
    public return(buffer: T) {
        this.buffers.push(buffer);
        this.sizes.push(this.sizeOf(buffer));
    }

    public reset() {
        for (const buffer of this.buffers) {
            this.discard(buffer);
        }

        this.buffers = [];
        this.sizes = [];
    }
}

export class SharedAllocator<T> {
    public current: T;
    private currentOffset = 0;

    public constructor(public allocator: Allocator<T>) {
    }

    public allocate(amount: number, align: number): number {
        const alloc = this.allocator;
        const current = this.current;

        if (!current) {
            this.current = alloc.allocate(amount);
            this.currentOffset = amount;
            return 0;
        }

        let offset = this.currentOffset;

        if (align > 1) {
            offset = offset + align - 1 - (offset + align - 1) % align;
        }

        const newOffset = offset + amount;

        if (newOffset > alloc.sizeOf(current)) {
            this.advance();
            return this.allocate(amount, align);
        }

        this.currentOffset = newOffset;

        return offset;
    }

    public advance() {
        this.current = null;
        this.currentOffset = 0;
    }

    public return(buffer: T) {
        this.allocator.return(buffer);
    }

    public reset() {
        this.advance();
        this.allocator.reset();
    }
}

export class RepeatableSharedAllocator<T> extends SharedAllocator<T> {
    private usedBuffers: T[] = [];

    public advance() {
        if (this.current) {
            this.usedBuffers.push(this.current);
        }

        super.advance();
    }

    public reset() {
        super.reset();
        this.usedBuffers = [];
    }

    public repeat() {
        super.reset();

        const buffers = this.usedBuffers;

        for (let i = buffers.length - 1; i >= 0; i--) {
            this.return(buffers[i]);
        }

        this.usedBuffers = [];
    }
}

