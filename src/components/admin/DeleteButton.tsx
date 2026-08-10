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

/**
 * Кнопка удаления с подтверждением.
 *
 * Клиентский компонент — иначе нечем открыть окно и показать уведомление.
 * Но само удаление всё равно происходит на сервере: сюда передаётся
 * серверное действие, а здесь только вопрос «точно?».
 *
 * Важно помнить: это окно — удобство, а не защита. Проверка прав живёт
 * в самом действии, и обойти её, минуя эту кнопку, нельзя.
 */
export function DeleteButton({
    action,
    название,
    что = 'Запись',
}: {
    action: () => Promise<void>;
    название: string;
    что?: string;
}) {
    const [открыто, setОткрыто] = useState(false);
    const [занят, startTransition] = useTransition();

    return (
        <Dialog open={открыто} onOpenChange={setОткрыто}>
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
                        {что} «{название}» удалится навсегда. Отменить это будет нельзя.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline">Отмена</Button>} />
                    <Button
                        variant="destructive"
                        disabled={занят}
                        onClick={() =>
                            startTransition(async () => {
                                await action();
                                setОткрыто(false);
                                toast.success('Удалено');
                            })
                        }
                    >
                        {занят ? 'Удаляю…' : 'Удалить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
