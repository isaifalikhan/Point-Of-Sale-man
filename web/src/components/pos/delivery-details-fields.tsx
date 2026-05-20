"use client";

import { Bike, MapPin, Phone, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VENUE } from "@/config/venue-public";

export type DeliveryDetails = {
  riderName: string;
  phone: string;
  address: string;
};

type DeliveryDetailsFieldsProps = {
  value: DeliveryDetails;
  onChange: (next: DeliveryDetails) => void;
  /** compact = cart sidebar; default = payment modal */
  variant?: "compact" | "default";
};

const RIDER_SUGGESTIONS = ["Ryder", "Ahmed", "Hassan", "Rider Team"];

export function DeliveryDetailsFields({
  value,
  onChange,
  variant = "default",
}: DeliveryDetailsFieldsProps) {
  const compact = variant === "compact";

  return (
    <div
      className={
        compact
          ? "space-y-3 rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3"
          : "space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"
      }
    >
      <div className="flex items-center gap-2">
        <Bike className="h-4 w-4 text-indigo-600" aria-hidden />
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-800">
          Delivery details
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery-rider" className="flex items-center gap-1.5 text-xs">
          <User className="h-3.5 w-3.5" />
          Rider name
        </Label>
        <Input
          id="delivery-rider"
          placeholder="e.g. Ryder"
          value={value.riderName}
          onChange={(e) => onChange({ ...value, riderName: e.target.value })}
          className={compact ? "h-9 bg-white" : "h-10 bg-white"}
          list="rider-suggestions"
        />
        <datalist id="rider-suggestions">
          {RIDER_SUGGESTIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery-phone" className="flex items-center gap-1.5 text-xs">
          <Phone className="h-3.5 w-3.5" />
          Customer cell
        </Label>
        <Input
          id="delivery-phone"
          type="tel"
          placeholder="03xx-xxxxxxx"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          className={compact ? "h-9 bg-white" : "h-10 bg-white"}
        />
        <p className="text-[10px] text-slate-500">
          Rider line: {VENUE.phones[1]!.numbers.join(", ")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery-address" className="flex items-center gap-1.5 text-xs">
          <MapPin className="h-3.5 w-3.5" />
          Delivery address
        </Label>
        <textarea
          id="delivery-address"
          rows={compact ? 2 : 3}
          placeholder="House / street / landmark, Oghi"
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          className="flex w-full resize-y rounded-xl border border-input bg-white px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>
    </div>
  );
}

export function isDeliveryDetailsValid(d: DeliveryDetails): boolean {
  return Boolean(d.riderName.trim() && d.phone.trim() && d.address.trim());
}
