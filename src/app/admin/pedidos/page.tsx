'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ClipboardList, Loader2, Calendar, Phone, Mail, MapPin, User } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error al obtener Ã³rdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = async (newStatus: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED" | null) => {
    if (!selectedOrder || !newStatus) return;
    
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Actualizar el estado de forma local
        const updated = { ...selectedOrder, status: newStatus };
        setSelectedOrder(updated);
        
        // Actualizar en el listado general
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === selectedOrder.id ? updated : o))
        );
      } else {
        alert('Error al actualizar el estado de la orden');
      }
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      alert('Error de conexiÃ³n al actualizar orden');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PAID': return 'Pagado';
      case 'SHIPPED': return 'Enviado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">GestiÃ³n de Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">Realiza seguimiento de tus ventas y actualiza sus estados</p>
      </div>

      {/* Tabla de Ã“rdenes */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Cargando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <h3 className="font-semibold text-lg">Sin Pedidos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            AÃºn no se han registrado compras en la tienda.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID de Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs truncate max-w-[120px]">{order.id}</TableCell>
                  <TableCell className="font-semibold">{order.customerName}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('es-UY', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right font-bold">${order.total.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetailModal(order)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-500 hover:bg-blue-50/50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Detalle de la Orden */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl bg-card text-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <span>Detalle de Pedido</span>
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              ID: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-2">
              {/* InformaciÃ³n del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-4 flex flex-col gap-2.5 text-sm">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Datos del Cliente
                    </h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${selectedOrder.customerEmail}`} className="hover:underline">{selectedOrder.customerEmail}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${selectedOrder.customerPhone}`} className="hover:underline">{selectedOrder.customerPhone}</a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-muted/30">
                  <CardContent className="p-4 flex flex-col gap-2.5 text-sm">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      EnvÃ­o y Entrega
                    </h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedOrder.customerAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>
                        {new Date(selectedOrder.createdAt).toLocaleDateString('es-UY', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selector de Estado */}
              <div className="flex items-center justify-between border-y border-border py-4">
                <span className="text-sm font-semibold text-foreground">Estado del Pedido:</span>
                <div className="flex items-center gap-2">
                  {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                  <Select
                    value={selectedOrder.status}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-[180px] bg-card text-foreground">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-card text-foreground border-border">
                      <SelectItem value="PENDING" className="cursor-pointer">Pendiente</SelectItem>
                      <SelectItem value="PAID" className="cursor-pointer">Pagado</SelectItem>
                      <SelectItem value="SHIPPED" className="cursor-pointer">Enviado</SelectItem>
                      <SelectItem value="CANCELLED" className="cursor-pointer text-destructive">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de productos comprados */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Productos Comprados
                </h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-12">Item</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-center w-16">Cant</TableHead>
                        <TableHead className="text-right w-24">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-2">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-8 w-8 rounded object-cover bg-muted border border-border"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell className="text-right">${item.price.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ${(item.price * item.quantity).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell colSpan={4} className="text-right py-3 text-base">Total:</TableCell>
                        <TableCell className="text-right py-3 text-base text-blue-600">
                          ${selectedOrder.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

