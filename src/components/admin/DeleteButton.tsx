'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/src/components/ui/dialog';

export function DeleteButton({
    action,
    name,
    what = 'Запись',
}: {
    action: () => Promise<void>;
    name: string;
    what?: string;
}) {
    const [open, setOpen] = useState(false);
    const [closed, startTransition] = useTransition();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="ghost" size="icon" aria-label="Удалить">
                        <Trash2 className="size-4 text-muted-foreground transition-colors hover:text-destructive" />
                    </Button>
                }
            />

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Удалить?</DialogTitle>
                    <DialogDescription>
                        {what} «{name}» удалится навсегда. Отменить это будет нельзя.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline">Отмена</Button>} />
                    <Button
                        variant="destructive"
                        disabled={closed}
                        onClick={() =>
                            startTransition(async () => {
                                await action();
                                setOpen(false);
                                toast.success('Удалено');
                            })
                        }
                    >
                        {closed ? 'Удаляю…' : 'Удалить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
