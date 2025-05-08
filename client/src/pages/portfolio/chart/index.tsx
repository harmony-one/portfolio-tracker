import { useEffect, useMemo, useRef, useState } from 'react';
import { BarPrice, createChart, IChartApi, ISeriesApi, LineSeries, Time, UTCTimestamp } from 'lightweight-charts';
import {PortfolioSnapshot, TradingViewItem} from '../../../types.ts';
import { darkTheme } from './theme';
import { Box, Text } from 'grommet';
import moment from 'moment';
import { defaultTooltipState, getTooltipState, TooltipContainer, TradingViewTooltipState } from './helpers.tsx';

export const TradingViewChart = (props: {
    height: number
    snapshots: PortfolioSnapshot[]
}) => {
    const { snapshots, height } = props

    const [chartInstance, setChartInstance] = useState<IChartApi>();
    const [chartSeries, setChartSeries] = useState<ISeriesApi<"Line", Time>>();
    const [tooltipState, setTooltipState] = useState<TradingViewTooltipState>(defaultTooltipState)

    const lineItems: TradingViewItem[] = useMemo(() => {
        return snapshots
          .reverse()
          .map(snapshot => {
            const unixTimestamp = moment(snapshot.createdAt).unix()
            return {
                time: Math.floor(unixTimestamp) as UTCTimestamp,
                value: snapshot.data.totalValueUSD,
            }
        })
    }, [snapshots])

    const chartContainerRef = useRef<HTMLDivElement>(null);

    const onCrosshairMove = (param: any, series: ISeriesApi<'Line'>) => {
        const newTooltipState = getTooltipState(chartContainerRef, param, series)
        if(newTooltipState) {
            setTooltipState(newTooltipState)
        }
    }

    useEffect(() => {
        if(chartInstance && chartSeries) {
            chartSeries.setData(lineItems);
            chartInstance.timeScale().fitContent()
        }
    }, [
        chartInstance,
        chartSeries,
        lineItems
    ]);

    useEffect(() => {
        if(!chartContainerRef.current) {
            return
        }

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current?.clientWidth,
            height,
            rightPriceScale: {
                borderVisible: false,
                visible: true,
            },
            leftPriceScale: {
                visible: false,
            },
            timeScale: {
                borderVisible: false,
                tickMarkFormatter: (time: UTCTimestamp) => {
                    return moment(time * 1000).format('HH:mm');
                }
            },
            grid: {
                vertLines: {
                    visible: false
                },
                horzLines: {
                    visible: true
                }
            },
            localization: {
                priceFormatter: (priceValue: BarPrice) => {
                    return `${Math.round(priceValue)} USD`
                }
            },
        });
        chart.applyOptions(darkTheme.chart)
        chart.timeScale().fitContent();

        const series = chart.addSeries(LineSeries);
        chart.subscribeCrosshairMove((param) => onCrosshairMove(param, series))

        setChartInstance(chart)
        setChartSeries(series)
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    },
    [chartContainerRef.current]
    );

    const tooltip = useMemo(() => {
        return {
            ...tooltipState,
            title: 'Total value',
            value: `Total value: ${tooltipState.value}`,
            pendlePTValue: `${tooltipState.pendlePTValue}`,
        }
    }, [tooltipState])

    return <Box style={{ position: 'relative' }}>
        <Box style={{
            // opacity: loadingError ? 0.4 : undefined,
            // filter: loadingError ? 'blur(2px)' : undefined
        }}>
            <Box>
                <div
                    ref={chartContainerRef}
                    style={{ position: 'relative', width: '100%' }}
                >
                    {tooltip.visible &&
                        <TooltipContainer
                            style={{
                                top: `${tooltip.top}px`,
                                left: `${tooltip.left}px`,
                                display: 'flex'
                            }}
                            justify={'center'}
                            key={tooltip.value}
                        >
                            <Text color={'accentWhite'}>
                                {moment(+tooltip.time * 1000).format('MMM D, YYYY, HH:mm')}
                            </Text>
                            <Box direction={'row'} margin={{top: '2px'}} gap={'8px'}>
                                {/*{tooltip.title &&*/}
                                {/*    <Text color={'text'} size={'16px'} weight={600}>*/}
                                {/*        {tooltip.title}*/}
                                {/*    </Text>*/}
                                {/*}*/}
                                <Box>
                                    <Text color={'accentWhite'} size={'16px'} weight={600}>
                                        {tooltip.value}
                                    </Text>
                                </Box>
                            </Box>
                        </TooltipContainer>
                    }
                </div>
            </Box>
        </Box>
    </Box>
}
