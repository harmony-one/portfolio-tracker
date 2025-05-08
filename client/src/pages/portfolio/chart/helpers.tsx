import styled from 'styled-components';
import { Box } from 'grommet';
import { ISeriesApi } from 'lightweight-charts';
import { RefObject } from 'react';
import {TradingViewItem} from "../../../types.ts";

export interface TradingViewTooltipState {
    visible: boolean
    time: string,
    left: number,
    top: number
    title: string,
    value: string,
    pendlePTValue: string,
}

export const defaultTooltipState: TradingViewTooltipState = {
    visible: false,
    time: '',
    left: 0,
    top: 0,
    title: '',
    value: '',
    pendlePTValue: '',
}

export const toolTipWidth = 260;
export const toolTipHeight = 120;
export const toolTipMargin = 15;

export const WidgetContainer = styled(Box)`
    padding: 16px;
    border-radius: 12px;
    background: #1E1E20;
    position: relative;
    height: inherit;
`

export const TooltipContainer = styled(WidgetContainer)`
    position: absolute;
    display: none;
    color: #ADAEB8;
    background-color: #2D3344;
    width: ${toolTipWidth + 16}px;
    height: ${toolTipHeight}px;
    padding: 0 12px;
    text-align: left;
    z-index: 10;
    top: 12px;
    left: 12px;
    border: 1px solid #2D2E43;
    pointer-events: none;
`

export const getTooltipState = (
    chartContainerRef: RefObject<HTMLDivElement>,
    param: any,
    series: ISeriesApi<'Line'>,
    lineItems: TradingViewItem[]
) => {
    if (!chartContainerRef.current) {
        return
    }
    const container = chartContainerRef.current
    let newTooltipState: TradingViewTooltipState = {...defaultTooltipState}

    if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
    ) {
        // tooltipRef.current.style.display = 'none';
    } else {
        const data = param.seriesData.get(series);
        const price = data.value
        const coordinate = series.priceToCoordinate(price);
        let shiftedCoordinate = param.point.x - 50;
        if (coordinate === null) {
            return;
        }
        shiftedCoordinate = Math.max(
            0,
            Math.min(container.clientWidth - toolTipWidth, shiftedCoordinate)
        );
        const coordinateY =
            coordinate - toolTipHeight - toolTipMargin > 0
                ? coordinate - toolTipHeight - toolTipMargin
                : Math.max(
                    0,
                    Math.min(
                        container.clientHeight - toolTipHeight - toolTipMargin,
                        coordinate + toolTipMargin
                    )
                );

        const matchingItem = lineItems.find(item => item.time === param.time);

        newTooltipState = {
            ...newTooltipState,
            visible: true,
            title: '',
            value: price,
            pendlePTValue: String(matchingItem?.pendlePTValue ?? 0),
            time: param.time,
            left: shiftedCoordinate,
            top: coordinateY
        }
    }
    return newTooltipState
}
