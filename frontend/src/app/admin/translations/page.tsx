'use client';

import { useState, useEffect } from 'react';
import { productsApi, categoriesApi, optionsApi, optionValuesApi, translationsApi } from '@/services/api';

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
];

export default function TranslationsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'options' | 'values'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [optionValues, setOptionValues] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'products') {
        const [prods, trans] = await Promise.all([
          productsApi.list(),
          translationsApi.listProductTranslations(),
        ]);
        setProducts(prods);
        setTranslations(trans);
      } else if (activeTab === 'categories') {
        const [cats, trans] = await Promise.all([
          categoriesApi.list(),
          translationsApi.listCategoryTranslations(),
        ]);
        setCategories(cats);
        setTranslations(trans);
      } else if (activeTab === 'options') {
        const [opts, trans] = await Promise.all([
          optionsApi.list(),
          translationsApi.listOptionTranslations(),
        ]);
        setOptions(opts);
        setTranslations(trans);
      } else if (activeTab === 'values') {
        const [vals, trans] = await Promise.all([
          optionValuesApi.list(),
          translationsApi.listOptionValueTranslations(),
        ]);
        setOptionValues(vals);
        setTranslations(trans);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreate = (itemId: number, language: string) => {
    setEditingTranslation(null);
    setFormData({
      [activeTab === 'products' ? 'product' : activeTab === 'categories' ? 'category' : activeTab === 'options' ? 'option' : 'option_value']: itemId,
      language,
      name: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleEdit = (translation: any) => {
    setEditingTranslation(translation);
    setFormData(translation);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTranslation) {
        if (activeTab === 'products') {
          await translationsApi.updateProductTranslation(editingTranslation.id, formData);
        } else if (activeTab === 'categories') {
          await translationsApi.updateCategoryTranslation(editingTranslation.id, formData);
        } else if (activeTab === 'options') {
          await translationsApi.updateOptionTranslation(editingTranslation.id, formData);
        } else {
          await translationsApi.updateOptionValueTranslation(editingTranslation.id, formData);
        }
      } else {
        if (activeTab === 'products') {
          await translationsApi.createProductTranslation(formData);
        } else if (activeTab === 'categories') {
          await translationsApi.createCategoryTranslation(formData);
        } else if (activeTab === 'options') {
          await translationsApi.createOptionTranslation(formData);
        } else {
          await translationsApi.createOptionValueTranslation(formData);
        }
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar traducción?')) return;
    try {
      if (activeTab === 'products') {
        await translationsApi.deleteProductTranslation(id);
      } else if (activeTab === 'categories') {
        await translationsApi.deleteCategoryTranslation(id);
      } else if (activeTab === 'options') {
        await translationsApi.deleteOptionTranslation(id);
      } else {
        await translationsApi.deleteOptionValueTranslation(id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting translation:', error);
    }
  };

  const getItems = () => {
    if (activeTab === 'products') return products;
    if (activeTab === 'categories') return categories;
    if (activeTab === 'options') return options;
    return optionValues;
  };

  const getItemTranslations = (itemId: number) => {
    const key = activeTab === 'products' ? 'product' : activeTab === 'categories' ? 'category' : activeTab === 'options' ? 'option' : 'option_value';
    return translations.filter((t: any) => t[key] === itemId);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-light mb-8 text-stone-800">Traducciones</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        {[
          { key: 'products', label: 'Productos' },
          { key: 'categories', label: 'Categorías' },
          { key: 'options', label: 'Opciones' },
          { key: 'values', label: 'Valores' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-light transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-amber-600 text-amber-600'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-6">
        {getItems().map((item: any) => {
          const itemTranslations = getItemTranslations(item.id);
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <h3 className="text-lg font-medium text-stone-800 mb-4">{item.name}</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {LANGUAGES.map((lang) => {
                  const translation = itemTranslations.find((t: any) => t.language === lang.code);
                  return (
                    <div key={lang.code} className="border border-stone-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-stone-600">{lang.name}</span>
                        {translation ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(translation)}
                              className="text-amber-600 hover:text-amber-700 text-sm"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(translation.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreate(item.id, lang.code)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            + Agregar
                          </button>
                        )}
                      </div>
                      {translation && (
                        <div className="text-sm text-stone-700">
                          <p className="font-medium">{translation.name}</p>
                          {translation.description && (
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{translation.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-light mb-4 text-stone-800">
              {editingTranslation ? 'Editar' : 'Nueva'} Traducción
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Idioma</label>
                <input
                  type="text"
                  value={LANGUAGES.find(l => l.code === formData.language)?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              {activeTab === 'products' && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
