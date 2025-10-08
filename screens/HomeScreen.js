import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setAllProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products/categories")
      .then(res => res.json())
      .then(data => setCategories(["all", ...data]))
      .catch(err => console.log(err));
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category === category);
      setProducts(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => window.location.reload()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate("Details", { id: item.id })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {item.title.length > 40 ? item.title.substring(0, 40) + "..." : item.title}
        </Text>
        <Text style={styles.price}>R{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShopEZ</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Cart")}>
            <Text style={styles.icon}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Login")}>
            <Text style={styles.icon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            style={[
              styles.categoryButton, 
              selectedCategory === cat && styles.categoryButtonSelected
            ]}
            onPress={() => filterByCategory(cat)}
          >
            <Text style={[
              styles.categoryText, 
              selectedCategory === cat && styles.categoryTextSelected
            ]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafc' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  iconRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconButton: { 
    marginLeft: 16, 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    padding: 8, 
    borderRadius: 8 
  },
  icon: { 
    fontSize: 20, 
    color: 'white' 
  },
  categoryScroll: { 
    marginVertical: 8 
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonSelected: { 
    backgroundColor: '#2563eb' 
  },
  categoryText: { 
    color: '#1e293b', fontWeight: '600' 
  },
  categoryTextSelected: { 
    color: 'white' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f9fafc' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#2563eb' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f9fafc', 
    padding: 20 },
  errorText: { 
    fontSize: 18, 
    color: '#dc2626', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  retryButton: { 
    backgroundColor: '#2563eb', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  retryText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  listContent: { 
    padding: 12 
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  thumbnail: { 
    width: 70, 
    height: 70, 
    resizeMode: "contain", 
    marginRight: 16 
  },
  textContainer: { 
    flex: 1 
  },
  title: { 
    fontSize: 16, 
    fontWeight: "500", 
    color: '#1e293b', 
    marginBottom: 4 
  },
  price: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: '#2563eb' 
  },
  arrowContainer: { 
    padding: 8, 
    backgroundColor: '#eff6ff', 
    borderRadius: 20 
  },
  arrow: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2563eb'
  },
});

export default HomeScreen;
