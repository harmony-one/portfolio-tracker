import { ChartOptionsBase, ColorType, DeepPartial, LineStyleOptions } from 'lightweight-charts';

// Theme source: https://jsfiddle.net/TradingView/6yLzrbtd/

export const darkTheme: {
    chart: DeepPartial<ChartOptionsBase>
    series: DeepPartial<LineStyleOptions>
} = {
    chart: {
        handleScale: false,
        handleScroll: false,
        layout: {
            background: {
                type: ColorType.Solid,
                color: 'transparent',
            },
            textColor: '#D9D9D9',
            attributionLogo: false
        },
        // watermark: {
        //     color: 'rgba(0, 0, 0, 0)',
        // },
        crosshair: {
            vertLine: { color: '#758696', }
        },
        grid: {
            vertLines: {
                color: '#2B2B43',
                visible: false
            },
            horzLines: {
                color: '#2B2B43',
            },
        },
    },
    series: {
        color: '#00A3FF',
        lineWidth: 2
    },
};

export const lightTheme = {
    chart: {
        layout: {
            background: {
                type: ColorType.Solid,
                color: '#FFFFFF',
            },
            lineColor: '#2B2B43',
            textColor: '#191919',
        },
        watermark: {
            color: 'rgba(0, 0, 0, 0)',
        },
        grid: {
            vertLines: {
                visible: false,
            },
            horzLines: {
                color: '#f0f3fa',
            },
        },
    },
    series: {
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
    },
};
