import React, { useCallback, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "styled-components";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { VictoryPie } from 'victory-native';
import { HistoryCard } from "../../components/HistoryCard";
import { DataListProps } from "../Dashboard";
import { 
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  SelectIcon,
  Month,
  LoadContainer,
} from './styles';
import { categories } from "../../utils/categories";
import { ScrollView } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActivityIndicator } from "react-native";
import { useAuth } from "../../hooks/auth";

interface CategoryData{
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume(){
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);
  const { user } = useAuth();
  const theme = useTheme();

  function handleChangeDate(action: 'next' | 'prev'){
    if(action === 'next') {
      const newDate = addMonths(selectedDate, 1);
      setSelectedDate(newDate);
    } else {
      const newDate = subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormated = response ? JSON.parse(response) : [];
    
    const expensives = responseFormated
      .filter((expensive: DataListProps) => 
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
      );
    const expensiveTotal = expensives
      .reduce((acumullator: number, expensive: DataListProps ) => {
        return acumullator + Number(expensive.amount);
      }, 0);

    const totalByCategory: CategoryData[] = [];

    categories.forEach(category => {
      let categorySum = 0;

      expensives.forEach((expensive: DataListProps) => {
        if(expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      if (categorySum > 0) {
        const totalFormatted = categorySum
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });

        const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          totalFormatted,
          total: categorySum,
          color: category.color,
          percent,
        });  
      }
      

    });

    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(useCallback(()=>{
    loadData();
  }, [selectedDate]));

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      { 
        isLoading ? 
          <LoadContainer>
            <ActivityIndicator 
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer> :

        <Content
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: useBottomTabBarHeight(),
          }}
        >
          <MonthSelect>
            <MonthSelectButton onPress={()=>handleChangeDate('prev')}>
              <SelectIcon name="chevron-left"/>
            </MonthSelectButton>

            <Month>{format(selectedDate, "MMMM, yyyy", {locale: ptBR})}</Month>

            <MonthSelectButton onPress={()=>handleChangeDate('next')}>
              <SelectIcon name="chevron-right"/>
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie 
              data={totalByCategories}
              colorScale={totalByCategories.map(category => category.color)}
              style={{
                labels: { 
                  fontSize: RFValue(18),
                  fontWeight: 'bold',
                  fill: theme.colors.shape
                }
              }}
              labelRadius={80}
              x="percent"
              y="total"
            />
          </ChartContainer>

        {
          totalByCategories.map(item => (
            <HistoryCard 
              key={item.key}
              title={item.name}
              amount={item.totalFormatted}
              color={item.color}
            />
          ))
          
        }
        </Content>
      }
    </Container>
  )
}