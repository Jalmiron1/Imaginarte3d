'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Datos del Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  
  const [uploadingField, setUploadingField] = useState<'image1' | 'image2' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const existingCategories = React.useMemo(() => {
    const defaults = ['Figuras', 'Decoración', 'Accesorios', 'Llaveros', 'Otros'];
    const cats = products.map((p) => p.category);
    return Array.from(new Set([...defaults, ...cats].filter(Boolean)));
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedProduct(null);
    setName('');
    setDescription('');
    setPrice(0);
    setDiscount(0);
    setStock(0);
    setCategory('');
    setImageUrl('');
    setImageUrl2('');
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setDiscount(product.discount);
    setStock(product.stock);
    setCategory(product.category);
    const urls = product.imageUrl.split(',');
    setImageUrl(urls[0] || '');
    setImageUrl2(urls[1] || '');
    setFormError('');
    setFormOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setFormError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      if (field === 'image1') {
        setImageUrl(data.imageUrl);
      } else {
        setImageUrl2(data.imageUrl);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al subir el archivo');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name,
      description,
      price: Number(price),
      discount: Number(discount),
      stock: Number(stock),
      category,
      imageUrl: [imageUrl, imageUrl2].filter(Boolean).join(','),
    };

    try {
      const url = selectedProduct ? `/api/admin/products/${selectedProduct.id}` : '/api/admin/products';
      const method = selectedProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el producto');
      }

      setFormOpen(false);
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el producto');
      }

      setDeleteOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar el producto');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Crea, edita o elimina los productos del catálogo</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 cursor-pointer self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Agregar Producto</span>
        </Button>
      </div>

      {/* Tabla de Productos */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Cargando productos del catálogo...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <h3 className="font-semibold text-lg">Catálogo Vacío</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Haz clic en &quot;Agregar Producto&quot; para publicar el primero.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center w-28">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.imageUrl.split(',')[0]}
                      alt={product.name}
                      className="h-10 w-10 rounded-md object-cover bg-muted border border-border"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{product.discount > 0 ? `${product.discount}%` : '-'}</TableCell>
                  <TableCell className="text-right">
                    <span className={product.stock === 0 ? 'text-destructive font-bold' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(product)}
                        className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(product)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal para Crear / Editar Producto */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg bg-card text-foreground border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Crear Producto'}</DialogTitle>
            <DialogDescription>
              Completa los datos del producto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="prod-name">Nombre</Label>
                <Input
                  id="prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Dragón articulado"
                  required
                />
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1.5 sm:col-span-2 relative">
                <Label htmlFor="prod-category">Categoría</Label>
                <div className="relative">
                  <Input
                    id="prod-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Escribe o selecciona una categoría..."
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDropdown((prev) => !prev);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={() => {
                            setCategory(cat);
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Precio */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-price">Precio (UYU)</Label>
                <Input
                  id="prod-price"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={price === 0 ? '' : String(price)}
                  placeholder="Ej: 1200"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPrice(raw === '' ? 0 : Number(raw));
                  }}
                  required
                />
              </div>

              {/* Descuento */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-discount">Descuento (%)</Label>
                <Input
                  id="prod-discount"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={discount === 0 ? '' : String(discount)}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const val = raw === '' ? 0 : Math.min(100, Number(raw));
                    setDiscount(val);
                  }}
                  required
                />
              </div>

              {/* Stock */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="prod-stock">Stock disponible</Label>
                <Input
                  id="prod-stock"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={stock === 0 ? '' : String(stock)}
                  placeholder="0"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setStock(raw === '' ? 0 : Number(raw));
                  }}
                  required
                />
              </div>

              {/* Imagen 1 (Subida de Archivo) */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Imagen Principal (Obligatoria)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:bg-accent transition-all shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image1')}
                      className="hidden"
                      disabled={uploadingField !== null || formSubmitting}
                    />
                  </label>
                  {uploadingField === 'image1' ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Subiendo...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1 bg-muted max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{imageUrl}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImageUrl('')}
                        className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-1 rounded-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Ningún archivo subido</span>
                  )}
                </div>
              </div>

              {/* Imagen 2 (Subida de Archivo Opcional) */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Imagen Secundaria (Opcional)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:bg-accent transition-all shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image2')}
                      className="hidden"
                      disabled={uploadingField !== null || formSubmitting}
                    />
                  </label>
                  {uploadingField === 'image2' ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Subiendo...</span>
                    </div>
                  ) : imageUrl2 ? (
                    <div className="flex items-center gap-2 border border-border rounded-md px-2 py-1 bg-muted max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{imageUrl2}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImageUrl2('')}
                        className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-1 rounded-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Ningún archivo subido</span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="prod-description">Descripción</Label>
                <Textarea
                  id="prod-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre el material, dimensiones, articulaciones..."
                  rows={3}
                  required
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {formError}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={formSubmitting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formSubmitting || uploadingField !== null || !imageUrl}
                className="cursor-pointer"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Producto'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación para Eliminar */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará el producto &quot;{selectedProduct?.name}&quot; del catálogo de forma permanente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="cursor-pointer"
            >
              Confirmar Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

