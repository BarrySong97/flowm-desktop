import { useState } from "react"
import { Button, Input, Label, Modal, TextField } from "@heroui/react"
import { useTranslation } from "react-i18next"
import { Plus } from "lucide-react"
import { useFlowmStore } from "../../lib/stores/flowmStore"

export function BusinessActionDialog() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("38.00")
  const [payee, setPayee] = useState("KFC")
  const runCommand = useFlowmStore((state) => state.runCommand)

  const submitExpense = () => {
    void runCommand(`EXP ${amount} FOOD ${payee}`)
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" variant="outline" onPress={() => setOpen(true)}>
        <Plus className="size-3" />
        {t("toolbar.new")}
      </Button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop />
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{t("dialog.quickActionTitle")}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-[12px] text-[var(--term-ink-3)]">{t("dialog.quickActionDescription")}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{t("dialog.amount")}</Label>
                  <TextField>
                    <Input value={amount} onChange={(event) => setAmount(event.target.value)} />
                  </TextField>
                </div>
                <div className="grid gap-1">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{t("dialog.payee")}</Label>
                  <TextField>
                    <Input value={payee} onChange={(event) => setPayee(event.target.value)} />
                  </TextField>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setOpen(false)}>{t("dialog.cancel")}</Button>
              <Button onPress={submitExpense}>{t("dialog.commitExpense")}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </>
  )
}
