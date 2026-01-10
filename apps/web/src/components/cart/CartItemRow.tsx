import Image from "next/image";
import { CartItem } from "@/stores/cart-store";

interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}

export function CartItemRow({ item, onRemove, onUpdateQuantity }: CartItemRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6">
      {/* Product Info */}
      <div className="col-span-1 md:col-span-6 flex gap-4">
        <div className="relative w-24 h-28 bg-secondary shrink-0 overflow-hidden rounded-sm">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-gray-100">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 space-x-2">
            {item.size && <span>Size: {item.size}</span>}
            {item.size && item.color && <span>•</span>}
            {item.color && <span>Color: {item.color}</span>}
          </p>
          <button
            onClick={onRemove}
            className="mt-2 text-xs text-muted-foreground hover:text-red-600 transition-colors text-left underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
        <div className="flex items-center border border-gray-200 rounded-sm">
          <button
            onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-black"
          >
            −
          </button>
          <span className="w-8 h-8 flex items-center justify-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-black"
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
        <span className="md:hidden text-sm text-muted-foreground mr-2">Price:</span>
        <span className="text-sm">₦{item.price.toLocaleString()}</span>
      </div>

      {/* Total */}
      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-end">
        <span className="md:hidden text-sm text-muted-foreground mr-2">Total:</span>
        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
      </div>
    </div>
  );
}
