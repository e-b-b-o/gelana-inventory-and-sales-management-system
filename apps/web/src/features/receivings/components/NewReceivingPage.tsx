import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../../auth/api/auth';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReceivingSchema, useCreateReceiving } from '../api';
import type { CreateReceivingDto } from '../api';
import { useBranches } from '../../branches/api';
import { useSuppliers } from '../../suppliers/api';
import { useProducts } from '../../products/api';
import { useNavigate } from 'react-router-dom';

export function NewReceivingPage() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const user = userResponse?.user;
  const navigate = useNavigate();
  const { data: branchesData } = useBranches();
  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();

  const branches = branchesData || [];
  const suppliers = suppliersData || [];
  const products = productsData || [];
  const createReceivingMutation = useCreateReceiving();

  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<CreateReceivingDto>({
    resolver: zodResolver(createReceivingSchema),
    defaultValues: {
      branchId: '',
      supplierId: '',
      invoiceNumber: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const selectedBranchId = watch('branchId');

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * (item.unitCost || 0)), 0);
  }, [items]);

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = products?.find((p: any) => p.id === selectedProductId);
    if (!product) return;

    if (items.some(item => item.productId === selectedProductId)) {
      setSelectedProductId('');
      return;
    }

    append({
      productId: product.id,
      quantity: 1,
      unitCost: 0,
    });
    setSelectedProductId('');
  };

  const onSubmit = (data: CreateReceivingDto) => {
    createReceivingMutation.mutate(data, {
      onSuccess: () => {
        navigate('/inventory');
      },
    });
  };

  if (user?.role !== 'OWNER') {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] text-error mb-2">lock</span>
          <p>You are not authorized to create receiving transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header with Title & Top-Right Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">New Receiving</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Record stock received from a supplier and add it to a branch inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm" type="button" onClick={() => navigate('/inventory/movements')}>
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span className="">View Receiving History</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid (Receiving Setup + Items Table & Summary) */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start mt-space-lg">
        {/* Left / Core Flow: Configuration & Item Intake (8 cols desktop) */}
        <div className="xl:col-span-8 space-y-space-lg">
          
          {/* Section 1: Receiving Context & Setup Card */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-space-md">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">1</span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Receiving Details</h2>
              </div>
            </div>

            {/* 4-Step Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              
              {/* Step 1: Destination Branch */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Destination Branch <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="branchId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full h-[38px] px-3 pr-8 rounded border ${errors.branchId ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none`}
                      >
                        <option value="">Select branch...</option>
                        {branches?.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
                </div>
                {errors.branchId && <p className="text-xs text-error mt-1">{errors.branchId.message}</p>}
                <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">info</span> Stock will be added to this branch after confirmation.
                </p>
              </div>

              {/* Step 2: Supplier Selection */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Supplier <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full h-[38px] px-3 pr-8 rounded border ${errors.supplierId ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none`}
                      >
                        <option value="">Select supplier...</option>
                        {suppliers?.filter((s: any) => s.isActive).map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
                </div>
                {errors.supplierId && <p className="text-xs text-error mt-1">{errors.supplierId.message}</p>}
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="">One supplier per receiving transaction.</span>
                </div>
              </div>

              {/* Step 3: Receiving Date */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Receiving Date <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    disabled
                    className="w-full h-[38px] px-3 pl-9 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 opacity-70"
                    type="text"
                    value={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[18px]">calendar_today</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5">Defaulted to current business day.</p>
              </div>

              {/* Step 4: Supplier Invoice / Reference Number */}
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Supplier Invoice / Ref Number <span className="text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Controller
                    name="invoiceNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="e.g. INV-98214"
                        type="text"
                      />
                    )}
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1.5">Optional supplier reference for your records.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Product Search & Intake Section */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-space-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-headline-sm font-headline-sm text-on-surface">Product Intake</h2>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
                <select
                  className="w-full h-[40px] pl-10 pr-4 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product to add...</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="px-6 h-[40px] bg-primary text-on-primary rounded text-label-md font-label-md disabled:opacity-50 hover:bg-primary-hover transition-colors"
              >
                Add
              </button>
            </div>
            {errors.items && !fields.length && <p className="text-xs text-error mt-2">{errors.items.message}</p>}
          </div>

          {/* Section 3: Receiving Items Table */}
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
            <div className="p-space-md flex items-center justify-between border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Receiving Items</h3>
                <span className="px-2.5 py-0.5 text-label-sm font-label-sm rounded-full bg-success-container text-success">{fields.length} Products Added</span>
              </div>
              <span className="text-body-sm font-body-sm text-on-surface-variant">Currency: Ethiopian Birr (ETB)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-outline-variant">
                    <th className="py-2.5 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Product Details</th>
                    <th className="py-2.5 px-3 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">SKU</th>
                    <th className="py-2.5 px-3 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Unit</th>
                    <th className="py-2.5 px-3 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider w-28">Quantity</th>
                    <th className="py-2.5 px-3 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider w-36">Purchase Cost</th>
                    <th className="py-2.5 px-3 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider text-right">Line Total</th>
                    <th className="py-2.5 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {fields.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant text-body-md font-body-md">
                        No products added yet. Select a product above.
                      </td>
                    </tr>
                  )}
                  {fields.map((field, index) => {
                    const product = products?.find((p: any) => p.id === field.productId);
                    const qty = items[index]?.quantity || 0;
                    const cost = items[index]?.unitCost || 0;
                    
                    return (
                      <tr key={field.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-on-surface text-body-md font-body-md">{product?.name}</div>
                          <div className="text-[11px] text-on-surface-variant">{product?.categoryId || 'General'}</div>
                        </td>
                        <td className="py-3 px-3 text-body-sm font-body-sm font-mono text-on-surface">{product?.sku}</td>
                        <td className="py-3 px-3 text-body-sm font-body-sm text-on-surface capitalize">{product?.unit}</td>
                        <td className="py-3 px-3">
                          <Controller
                            name={`items.${index}.quantity`}
                            control={control}
                            render={({ field: qField }) => (
                              <input
                                {...qField}
                                onChange={(e) => qField.onChange(Number(e.target.value))}
                                className={`w-20 h-[34px] px-2.5 rounded border ${errors.items?.[index]?.quantity ? 'border-error' : 'border-outline-variant'} text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right`}
                                type="number"
                                min="1"
                              />
                            )}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="relative">
                            <span className="absolute left-2 top-2 text-xs text-on-surface-variant">ETB</span>
                            <Controller
                              name={`items.${index}.unitCost`}
                              control={control}
                              render={({ field: cField }) => (
                                <input
                                  {...cField}
                                  onChange={(e) => cField.onChange(Number(e.target.value))}
                                  className={`w-32 h-[34px] pl-9 pr-2.5 rounded border ${errors.items?.[index]?.unitCost ? 'border-error' : 'border-outline-variant'} text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary text-right font-mono`}
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                />
                              )}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-on-surface text-body-md font-body-md font-mono">
                          {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(qty * cost)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded transition-colors"
                            title="Remove Item"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-cream border-t border-cream-border flex items-start gap-2.5 text-body-sm font-body-sm text-on-surface">
              <span className="material-symbols-outlined text-warning text-[18px] shrink-0 mt-0.5">verified_user</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <strong className="font-semibold text-on-surface">Valuation Notice:</strong> Purchase cost is preserved with this receiving record and used for inventory costing.
              </p>
            </div>
          </div>
        </div>

        {/* Right Core: Summary & Confirmation Card (4 cols desktop) */}
        <div className="xl:col-span-4 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-space-md sticky top-20">
            <h3 className="text-headline-sm font-headline-sm text-on-surface pb-3 border-b border-outline-variant">Receiving Summary</h3>
            
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-body-md font-body-md">
                <span className="text-on-surface-variant">Products / Line Items</span>
                <span className="font-bold text-on-surface text-base">{fields.length}</span>
              </div>
              <div className="flex items-center justify-between text-body-md font-body-md pt-2 border-t border-outline-variant">
                <span className="text-on-surface font-semibold">Total Purchase Cost</span>
                <span className="font-extrabold text-primary text-xl font-mono">
                  {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(totalCost)}
                </span>
              </div>
            </div>

            {selectedBranchId && (
              <div className="my-3 p-3 bg-surface-container-low rounded border border-outline-variant flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
                <div className="text-xs">
                  <span className="font-semibold text-on-surface block">
                    Destination: {branches?.find((b: any) => b.id === selectedBranchId)?.name}
                  </span>
                  <span className="text-on-surface-variant">Stock will be added to this branch after confirmation.</span>
                </div>
              </div>
            )}

            <div className="mb-5 p-3 bg-surface border border-outline-variant rounded text-[11px] text-on-surface-variant leading-relaxed">
              Confirming this receiving will add the recorded quantities to the destination inventory and create a receiving record.
            </div>

            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={createReceivingMutation.isPending || fields.length === 0}
                className="w-full h-11 bg-primary-container hover:bg-[#0039CC] text-on-primary text-label-lg font-label-lg rounded font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">inventory</span>
                <span>{createReceivingMutation.isPending ? 'Confirming...' : 'Confirm Receiving'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => reset()}
                disabled={createReceivingMutation.isPending}
                className="w-full h-9 bg-transparent hover:bg-surface-container text-on-surface-variant text-label-md font-label-md rounded border border-outline-variant transition-colors flex items-center justify-center"
              >
                Clear Receiving
              </button>
            </div>
            
            {createReceivingMutation.isError && (
              <div className="mt-4 text-sm text-error font-bold p-3 bg-error-container/40 rounded border border-error-container">
                Failed to confirm receiving. Please check your inputs.
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
