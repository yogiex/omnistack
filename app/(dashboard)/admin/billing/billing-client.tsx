"use client"

import { useState } from "react"
import { CreditCard, FileText, Plus, Receipt, Trash2, TrendingDown, Download } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { MockUser, Role } from "@/lib/mock-data"
import { MOCK_USERS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const BILLING_STATS = [
  {
    title: "MRR",
    value: "$87/mo",
    note: "Monthly recurring revenue",
    icon: CreditCard,
  },
  {
    title: "Active Subs",
    value: "3",
    note: "Subscription aktif",
    icon: Receipt,
  },
  {
    title: "Unpaid Invoices",
    value: "1",
    note: "Perlu ditindaklanjuti",
    icon: FileText,
  },
  {
    title: "Churn Rate",
    value: "2.1%",
    note: "↓ 0.3% vs bulan lalu",
    icon: TrendingDown,
  },
]

const MONTHLY_REVENUE = [
  { month: "May", amount: 1200, max: 5000 },
  { month: "Jun", amount: 2800, max: 5000 },
  { month: "Jul", amount: 3200, max: 5000 },
  { month: "Aug", amount: 4520, max: 5000 },
]

const BILLING_STATUS: Record<string, { nextBilling: string; status: string }> = {
  "user-admin-001": { nextBilling: "2026-09-01", status: "Active" },
  "user-dev-002": { nextBilling: "2026-09-01", status: "Active" },
  "user-viewer-003": { nextBilling: "-", status: "Active" },
}

const PLAN_FILTERS = ["All", "Enterprise", "Pro", "Free"]

interface PlanMeta {
  label: string
  price: string
  badgeClass: string
}

function getPlanMeta(role: Role): PlanMeta {
  if (role === "ADMIN") {
    return {
      label: "Enterprise",
      price: "$99",
      badgeClass: "text-amber-500 border-amber-500/40 bg-amber-500/10",
    }
  }
  if (role === "USER") {
    return {
      label: "Pro",
      price: "$29",
      badgeClass: "text-blue-500 border-blue-500/40 bg-blue-500/10",
    }
  }
  return {
    label: "Free",
    price: "$0",
    badgeClass: "",
  }
}

const INVOICES = [
  { id: "INV-2026-0004", date: "1 Agu 2026", amount: "$29", paid: true },
  { id: "INV-2026-0003", date: "1 Jul 2026", amount: "$99", paid: true },
  { id: "INV-2026-0002", date: "1 Jun 2026", amount: "$99", paid: false },
  { id: "INV-2026-0001", date: "1 Mei 2026", amount: "$29", paid: true },
]

interface PaymentMethod {
  id: string
  type: "visa" | "mastercard" | "bank_transfer"
  brand: string
  last4: string
  expiry?: string
  isDefault: boolean
}

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-001",
    type: "visa",
    brand: "Visa",
    last4: "4242",
    expiry: "12/28",
    isDefault: true,
  },
  {
    id: "pm-002",
    type: "mastercard",
    brand: "Mastercard",
    last4: "8888",
    expiry: "06/27",
    isDefault: false,
  },
  {
    id: "pm-003",
    type: "bank_transfer",
    brand: "Bank Transfer BCA",
    last4: "1234",
    isDefault: false,
  },
]

export function BillingClient() {
  const [notice, setNotice] = useState<string | null>("")
  const [coupon, setCoupon] = useState("")

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [newCardNumber, setNewCardNumber] = useState("")
  const [newCardExpiry, setNewCardExpiry] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [planFilter, setPlanFilter] = useState<string>("All")
  const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false)
  const [invoiceUser, setInvoiceUser] = useState<string>(MOCK_USERS[0]?.id ?? "")
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceDue, setInvoiceDue] = useState("")

  const showNotice = (message: string) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }

  const handleManage = (user: MockUser) => {
    showNotice(`Kelola subscription ${user.email} (mock)`)
  }

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return
    showNotice("Kupon diterapkan (mock)")
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({ ...pm, isDefault: pm.id === id }))
    )
    showNotice("Metode pembayaran default diperbarui.")
  }

  const handleRemove = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id))
    setConfirmDeleteId(null)
    showNotice("Metode pembayaran dihapus.")
  }

  const handleAddNew = () => {
    if (!newCardNumber.trim() || !newCardExpiry.trim()) return
    const last4 = newCardNumber.slice(-4)
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: "visa",
      brand: "Visa",
      last4,
      expiry: newCardExpiry,
      isDefault: false,
    }
    setPaymentMethods((prev) => [...prev, newMethod])
    setAddSheetOpen(false)
    setNewCardNumber("")
    setNewCardExpiry("")
    showNotice(`Kartu Visa ${last4} ditambahkan.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Kelola subscription user, invoice, dan kupon promo.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {BILLING_STATS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue YTD</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$642</div>
            <p className="text-xs text-muted-foreground">Januari - Agustus 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Revenue Bulanan
          </CardTitle>
          <CardDescription>Pendapatan per bulan (USD)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MONTHLY_REVENUE.map((item) => (
            <div key={item.month} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">{item.month}</span>
              <div className="flex-1">
                <div className="h-6 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary transition-all"
                    style={{ width: `${(item.amount / item.max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-sm">${item.amount.toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Metode Pembayaran
            </CardTitle>
            <CardDescription>
              Kelola kartu dan rekening untuk pembayaran
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setAddSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Baru
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {pm.brand} ····{pm.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pm.expiry ? `Expires ${pm.expiry}` : "Rekening bank"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pm.isDefault ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/40 bg-green-500/10">
                    Default
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(pm.id)}
                  >
                    Set Default
                  </Button>
                )}
                {confirmDeleteId === pm.id ? (
                  <span className="flex items-center gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(pm.id)}
                    >
                      Hapus
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Batal
                    </Button>
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(pm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subscription user */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription User</CardTitle>
          <CardDescription>Plan dan harga per pengguna terdaftar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-1">
            {PLAN_FILTERS.map((plan) => (
              <Button
                key={plan}
                variant={planFilter === plan ? "default" : "outline"}
                size="sm"
                onClick={() => setPlanFilter(plan)}
              >
                {plan}
              </Button>
            ))}
          </div>
          {MOCK_USERS.filter((u) => {
            if (planFilter === "All") return true
            const meta = getPlanMeta(u.role)
            return meta.label === planFilter
          }).map((mockUser) => {
            const plan = getPlanMeta(mockUser.role)
            const initials = mockUser.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
            const billing = BILLING_STATUS[mockUser.id]
            return (
              <div
                key={mockUser.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {mockUser.avatar && (
                      <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                    )}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mockUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn(plan.badgeClass)}>
                    {plan.label}
                  </Badge>
                  <span className="font-mono text-sm">{plan.price}/mo</span>
                  {billing && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Next: {billing.nextBilling}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          billing.status === "Active"
                            ? "text-green-500 border-green-500/40 bg-green-500/10"
                            : "text-yellow-500 border-yellow-500/40 bg-yellow-500/10"
                        )}
                      >
                        {billing.status}
                      </Badge>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManage(mockUser)}
                  >
                    Kelola
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Invoice terakhir */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Invoice Terakhir</CardTitle>
            <CardDescription>4 invoice terbaru tahun 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {INVOICES.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{invoice.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{invoice.amount}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      invoice.paid
                        ? "text-green-500 border-green-500/40 bg-green-500/10"
                        : "text-yellow-500 border-yellow-500/40 bg-yellow-500/10"
                    )}
                  >
                    {invoice.paid ? "Paid" : "Unpaid"}
                  </Badge>
                  <Button variant="outline" size="sm" disabled>
                    Unduh PDF
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kupon */}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle>Kupon Promo</CardTitle>
            <CardDescription>
              Terapkan kupon untuk diskon subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan kode kupon"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
              />
              <Button onClick={handleApplyCoupon}>Apply</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setInvoiceSheetOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Invoice
        </Button>
        <Button
          variant="outline"
          onClick={() => showNotice("Billing report exported (mock)")}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Sheet: Create Invoice */}
      <Sheet open={invoiceSheetOpen} onOpenChange={setInvoiceSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Buat Invoice Baru</SheetTitle>
            <SheetDescription>
              Buat invoice untuk pengguna tertentu.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-user">Pengguna</Label>
              <select
                id="invoice-user"
                value={invoiceUser}
                onChange={(e) => setInvoiceUser(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {MOCK_USERS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-amount">Jumlah (USD)</Label>
              <Input
                id="invoice-amount"
                placeholder="29"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-due">Jatuh Tempo</Label>
              <Input
                id="invoice-due"
                type="date"
                value={invoiceDue}
                onChange={(e) => setInvoiceDue(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button onClick={() => {
              showNotice("Invoice dibuat (mock)")
              setInvoiceSheetOpen(false)
              setInvoiceAmount("")
              setInvoiceDue("")
            }}>
              Simpan Invoice
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Sheet: Add New Payment Method */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tambah Metode Pembayaran</SheetTitle>
            <SheetDescription>
              Masukkan detail kartu atau rekening baru.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Nomor Kartu</Label>
              <Input
                id="card-number"
                placeholder="4242 4242 4242 4242"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Expired Date</Label>
              <Input
                id="card-expiry"
                placeholder="MM/YY"
                value={newCardExpiry}
                onChange={(e) => setNewCardExpiry(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button onClick={handleAddNew}>Simpan</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
