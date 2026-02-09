import React from 'react';
import { X, MapPin, Home, DollarSign, Shield, Info } from 'lucide-react';

interface BuildingPopupProps {
  building: any;
  onClose: () => void;
  onViewDetails: () => void;
  position: { x: number; y: number };
}

const BuildingPopup: React.FC<BuildingPopupProps> = ({
  building,
  onClose,
  onViewDetails,
  position
}) => {
  if (!building) return null;

  // 计算弹窗位置，避免超出屏幕
  const getPopupPosition = () => {
    const popupWidth = 320;
    const popupHeight = 280;
    const margin = 20;
    
    let x = position.x;
    let y = position.y;
    
    // 确保不超出右边界
    if (x + popupWidth > window.innerWidth - margin) {
      x = window.innerWidth - popupWidth - margin;
    }
    
    // 确保不超出下边界
    if (y + popupHeight > window.innerHeight - margin) {
      y = window.innerHeight - popupHeight - margin;
    }
    
    // 确保不超出左边界
    x = Math.max(margin, x);
    y = Math.max(margin, y);
    
    return { x, y };
  };

  const popupPos = getPopupPosition();

  return (
    <div 
      className="fixed z-[1000] glass-panel rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{
        left: popupPos.x,
        top: popupPos.y,
        width: 320,
        minHeight: 280
      }}
    >
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={16} className="text-blue-400" />
            <h3 className="text-sm font-bold text-white truncate">
              {building.name || building.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={12} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-3">
        {/* 地址 */}
        {building.address && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-white/70 leading-relaxed">
              {building.address}
            </span>
          </div>
        )}

        {/* 价格 */}
        {building.rent && (
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-sm font-bold text-green-400">
              {building.rent}
            </span>
          </div>
        )}

        {/* 安全评分 */}
        {building.safetyScore && (
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-yellow-400" />
            <span className="text-xs text-white/70">
              安全评分: <span className="text-yellow-400 font-bold">{building.safetyScore}/100</span>
            </span>
          </div>
        )}

        {/* 建筑规格 */}
        {building.specs && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-purple-400" />
              <span className="text-xs text-white/70">建筑信息</span>
            </div>
            <div className="ml-6 space-y-0.5">
              {building.specs.height && (
                <div className="text-xs text-white/50">
                  高度: {building.specs.height}
                </div>
              )}
              {building.specs.units && (
                <div className="text-xs text-white/50">
                  单元数: {building.specs.units}
                </div>
              )}
              {building.specs.occupancy && (
                <div className="text-xs text-white/50">
                  状态: {building.specs.occupancy}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 坐标信息（用于搜索结果） */}
        {building.lat && building.lng && !building.address && (
          <div className="text-xs text-white/50">
            坐标: [{building.lat.toFixed(4)}, {building.lng.toFixed(4)}]
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="p-4 pt-2 border-t border-white/10 flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-xl text-xs font-bold text-white transition-all duration-200"
        >
          查看详情
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white/70 transition-all duration-200"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default BuildingPopup;
